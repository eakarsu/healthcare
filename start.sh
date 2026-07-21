#!/usr/bin/env bash
set -euo pipefail
source_dir="$(cd "$(dirname "$0")" && pwd)"
if [[ -n "${RUNTIME_PROJECT_SOURCE:-}" && -d "$RUNTIME_PROJECT_SOURCE" ]]; then source_dir="$RUNTIME_PROJECT_SOURCE"; fi
: "${PORT:?PORT must be set explicitly}"
: "${DATABASE_URL:?DATABASE_URL must be set explicitly}"
if [[ "${NODE_ENV:-}" != "production" && "${BOOTSTRAP_ACKNOWLEDGEMENT:-}" == "create-initial-admin" ]]; then
  export ENCRYPTION_KEY="${ENCRYPTION_KEY:-${MEMORY_ENCRYPTION_KEY_BASE64:?MEMORY_ENCRYPTION_KEY_BASE64 must be set for runtime acceptance}}"
  export CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-${NEXTAUTH_URL:?NEXTAUTH_URL must be set for runtime acceptance}}"
  export FHIR_ALLOWED_HOSTS="${FHIR_ALLOWED_HOSTS:-runtime.invalid}"
fi
exec npm --prefix "$source_dir" start
