#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$project_dir/.env"
set +a
mode="${1:-start}"

case "$mode" in
  check) npm --prefix "$project_dir" run typecheck; exit ;;
  migrate) npm --prefix "$project_dir" run db:migrate; exit ;;
  start) ;;
  *) echo 'usage: ./start.sh check|migrate|start' >&2; exit 2 ;;
esac

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET is required}"
: "${OPENROUTER_API_KEY:?OPENROUTER_API_KEY is required}"
: "${OPENROUTER_MODEL:?OPENROUTER_MODEL is required}"
: "${OPENROUTER_BASE_URL:?OPENROUTER_BASE_URL is required}"
case "$DATABASE_URL" in
  *connect_timeout=*) ;;
  *\?*) export DATABASE_URL="${DATABASE_URL}&connect_timeout=30" ;;
  *) export DATABASE_URL="${DATABASE_URL}?connect_timeout=30" ;;
esac
api_port="${BACKEND_PORT:-${PORT:?BACKEND_PORT or PORT is required}}"
ui_port="${FRONTEND_PORT:?FRONTEND_PORT is required}"
[[ "$api_port" != "$ui_port" ]] || { echo 'API and UI ports must differ' >&2; exit 1; }
for port in "$api_port" "$ui_port"; do
  ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 || { echo "Port $port is occupied" >&2; exit 1; }
done

export NEXTAUTH_URL="http://127.0.0.1:$api_port"
export NODE_ENV=development
export ENCRYPTION_KEY="${ENCRYPTION_KEY:-${MEMORY_ENCRYPTION_KEY_BASE64:?ENCRYPTION_KEY is required}}"
export CORS_ALLOWED_ORIGINS="http://127.0.0.1:$ui_port"
export FHIR_ALLOWED_HOSTS="${FHIR_ALLOWED_HOSTS:-runtime.invalid}"
export BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin
export PROVISION_ADMIN_EMAIL="${ADMIN_EMAIL:?ADMIN_EMAIL is required}"
export PROVISION_ADMIN_PASSWORD="${ADMIN_PASSWORD:?ADMIN_PASSWORD is required}"
export PROVISION_ADMIN_NAME="${PROVISION_ADMIN_NAME:-Runtime Administrator}"
export PROVISION_COMPANY_NAME="${PROVISION_COMPANY_NAME:-Runtime Acceptance Practice}"
"$project_dir/node_modules/.bin/prisma" generate
npm --prefix "$project_dir" run db:migrate
npm --prefix "$project_dir" run create-admin

cleanup() {
  trap - INT TERM EXIT
  [[ -z "${ui_pid:-}" ]] || kill "$ui_pid" 2>/dev/null || true
  [[ -z "${api_pid:-}" ]] || kill "$api_pid" 2>/dev/null || true
  [[ -z "${ui_pid:-}" ]] || wait "$ui_pid" 2>/dev/null || true
  [[ -z "${api_pid:-}" ]] || wait "$api_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

"$project_dir/node_modules/.bin/next" dev -H 127.0.0.1 -p "$api_port" &
api_pid=$!
for ((attempt=0; attempt<240; attempt++)); do
  curl -fsS "http://127.0.0.1:$api_port/login" >/dev/null 2>&1 && break
  kill -0 "$api_pid" 2>/dev/null || { wait "$api_pid"; exit $?; }
  sleep 0.5
done
curl -fsS "http://127.0.0.1:$api_port/login" >/dev/null
# Compile the credential-provider routes before exposing the public listener so
# bounded acceptance probes do not race Next.js's first-request compilation.
curl -fsS "http://127.0.0.1:$api_port/api/auth/providers" >/dev/null
curl -fsS "http://127.0.0.1:$api_port/api/auth/csrf" >/dev/null
curl -sS -o /dev/null -H 'Content-Type: application/json' -d '{}' "http://127.0.0.1:$api_port/api/auth/login"
curl -sS -o /dev/null "http://127.0.0.1:$api_port/api/auth/me"
RUNTIME_PROXY_PORT="$ui_port" RUNTIME_PROXY_TARGET_PORT="$api_port" node "$project_dir/_runtime-proxy.mjs" &
ui_pid=$!
wait "$api_pid" "$ui_pid"
