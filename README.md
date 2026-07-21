# Healthcare Practice clinical workflow

The supported high-risk journey is standards-based FHIR patient intake → deterministic identity reconciliation → active consent verification → practice-scoped record access → unsigned AI-assisted encounter draft → deterministic safety checks → clinician review and signature.

FHIR imports require an active registered connection, HTTPS allowlisted source, unique external event ID, exact payload hash, FHIR Patient plus active Consent, and MRN/legal name/birth date. Ambiguous identity matches stop for manual review without changing patient data. Replays return the original result and payload substitution is rejected.

Clinical AI never fabricates demo output when a provider is missing or fails. Scribe output is stored only as an unsigned `PENDING_REVIEW` draft with model, timestamp, input hash, author, patient, encounter, safety disposition, warnings, and blockers. Only a clinician/admin with an explicit attestation and every blocker resolved can copy the reviewed note into a signed encounter.

## Setup

```bash
npm ci
cp .env.example .env
# Replace every placeholder and use an external PostgreSQL service.
npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

Startup does not install packages, start/seed a database, mutate schema, or kill processes. Seeding is an explicit development-only action. The application container is unprivileged and contains no database server.

Required production controls include a strong `NEXTAUTH_SECRET`, explicit `CORS_ALLOWED_ORIGINS`, a valid 32-byte base64 `ENCRYPTION_KEY`, HTTPS `NEXTAUTH_URL`, and `FHIR_ALLOWED_HOSTS`. See [SECURITY.md](SECURITY.md) for field access, retention, encryption, and incident procedures.

## Verification

```bash
npx prisma validate
npm test
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=low
```

CI executes the initial migration against PostgreSQL 16, generates ephemeral test secrets, generates the client, runs governance tests, type-checks, builds, rejects every production dependency advisory, and scans full Git history for secrets. Tests cover exact/ambiguous identity matching, expired consent, contraindications, critical vitals, missing handoff data, field-level access, and provenance transport security.

Representative clinician/caseworker usability validation remains an organizational launch gate: test the FHIR reconciliation queue, safety escalation wording, review attestation, emergency handoff, downtime process, and incident drill with real authorized users before production.
