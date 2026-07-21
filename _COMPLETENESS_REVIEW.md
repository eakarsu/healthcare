# Completeness Review: healthcare

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 515 project files (456 source files), 4 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Functional but incomplete**

This is a substantive but unfinished healthcare/care operations application, not just an empty scaffold. Inspection found 456 source files across `src/`, `mobile/`, `ios-app/`, `mobile-app/` using Next.js, React, Prisma, Swift/iOS; however, the checked-in workflow and delivery controls do not yet demonstrate a complete, production-operable product.

## Why it is not complete

- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Integrate standards-based clinical/care data (for example FHIR where applicable) with identity matching and consent.
2. Add clinician/caseworker review boundaries, provenance, contraindication/safety checks, and escalation for uncertain output.
3. Implement field-level access control, audit history, retention, encryption, and regulated-data incident procedures.
4. Validate the intended workflow with representative users and test high-risk, missing-data, and handoff scenarios.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Weak/fallback secret patterns can permit forged sessions or accidental insecure deployments.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- AI-provider availability, cost, privacy, prompt injection, and unvalidated output are launch risks until bounded and evaluated.

## Evidence inspected

- `flutter-app/README.md`
- `prompt-healthcare-practice-ai.md:1421`
- `src/lib/ai.ts:26`
- `ios-app/Package.swift`
- `package.json`
- `start.sh`

## Recommended next action

Choose one real healthcare/care operations journey, define acceptance criteria and external contracts, then close its persistence, permission, integration, failure, and test gaps before expanding features.

## Implementation progress (2026-07-20)

Implemented the bounded FHIR patient-intake through clinician-signature journey. FHIR imports now require an authenticated clinical role, active practice-scoped HTTPS/allowlisted connection, Patient plus unexpired active Consent, deterministic identity reconciliation, event/hash idempotency, provenance, transactional audit history, and manual review for ambiguous matches. Practice-scoped FHIR reads require valid release consent, connection secrets use validated AES-256-GCM keys, and non-clinical field projections exclude clinical/direct-identifier fields.

AI scribe output now fails closed when its provider is unavailable, is retained only as an unsigned `PENDING_REVIEW` draft with source hash/model/user/encounter provenance, and is evaluated for missing handoff data, allergy/medication conflicts, and critical vitals. A separate clinician review endpoint requires exact attestation, resolution of every blocker, complete SOAP fields, and an audited transactional signature. Unsupported generated-gap and unreviewed AI product paths are denied by middleware.

Deployment no longer installs dependencies, kills processes, creates/pushes/seeds a database, or embeds PostgreSQL during startup. Added an unprivileged external-database container, explicit runtime secret/CORS/TLS validation, fail-closed PHI auditing, bounded non-logging email delivery, CSV formula-injection protection, retention/incident procedures, an initial Prisma migration, and CI for migration, tests, type-check, build, low-severity dependency auditing, and full-history secret scanning. CI generates its cryptographic test material for each run instead of storing reusable keys.

Verification completed: Prisma schema validation; the initial migration applied to a clean PostgreSQL database (79 public tables) and a second deploy reported no pending migrations; 8/8 identity, consent, safety, handoff, access, provenance, runtime-config, and authenticated-encryption tests passed; TypeScript type-check passed; and the Next.js 15.5.20 production build passed without application secrets. Independent follow-up removed 65 generated gap/demo and unreviewed AI routes/pages, retained only the governed scribe workflow, migrated dynamic-route parameter handling to the patched framework contract, and confirmed zero dependency vulnerabilities. `git diff --check` and current/history secret scans passed. Representative clinician/caseworker usability, escalation, downtime, and incident-drill validation remains an organizational launch gate.

## Runtime acceptance (2026-07-20)

The non-suite validator passed the final rebuilt state on PostgreSQL `55653`,
API `6110`, and UI `6111` at `2026-07-20T21:15:50Z`, recording
`API_VERIFIED / startup_login_session_api`. The run used an explicitly
provisioned active practice administrator with an environment-supplied bcrypt
password and proved the real NextAuth credentials callback, short-lived signed
session endpoint, and authenticated API. The production external-service
requirements remain strict; only the exact non-production bootstrap
acknowledgement permits the isolated local acceptance database and HTTP origin.
The legacy demo seed is no longer auto-discovered, is separately destructive-
acknowledgement gated, and contains no repository password or login UI hint.
