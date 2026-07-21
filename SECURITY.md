# Regulated-data security and incident procedure

This repository can process protected health information (PHI), but source code alone does not make a deployment HIPAA compliant. The deploying organization must execute BAAs, complete a risk analysis, validate controls with its privacy/security officers, and operate approved infrastructure.

## Access and encryption

- Use a managed PostgreSQL service with TLS, storage encryption, point-in-time recovery, and private networking. Application-level AES-256-GCM keys must be 32 random bytes in base64 and stored in a managed KMS/secret store.
- Clinical interoperability is limited to clinical roles and the authenticated practice. Reception and billing field projections exclude clinical and direct identifier fields they do not need.
- Every PHI read, FHIR identity decision, AI draft, and clinician signature must create an audit record. Audit failure is a request failure, never a best-effort warning.
- FHIR connections require HTTPS and an explicit hostname allowlist. Store OAuth client secrets encrypted and rotate them according to provider policy.

## Retention

The default operational schedule is: clinical records and amendments retained per the longest applicable federal/state/payer requirement; access and disclosure audit records retained at least six years; raw ambient audio disabled unless specifically approved and deleted after transcription verification; AI inputs/outputs retained with the encounter only while required for review/audit. A practice must configure a jurisdiction-specific schedule, litigation holds, verified deletion, and backup expiry before production. Never run bulk deletion without privacy-officer approval and a restorable backup.

## Incident response

1. Preserve evidence and immediately contain the affected account, key, connector, or host. Do not alter audit records.
2. Notify the security and privacy officers; start an incident record with detection time, systems, data classes, patients, and jurisdictions.
3. Rotate affected credentials, revoke sessions/tokens, isolate unsafe integrations, and retain forensic snapshots under chain of custody.
4. Determine acquisition/access/use/disclosure scope and complete the applicable breach risk assessment. Legal/privacy owners—not application code—decide notification obligations and deadlines.
5. Notify affected organizations, individuals, regulators, and law enforcement as required; document decisions and evidence.
6. Restore from verified clean state, monitor for recurrence, complete corrective actions, and test them.

Report suspected exposure through the organization’s private security channel. Do not place PHI, secrets, or exploit details in a public issue.

## Dependency advisory tracking

As of 2026-07-20, the application is migrated to patched Next.js 15.5.20 and `npm audit --omit=dev --audit-level=low` reports zero vulnerabilities. CI rejects any production dependency advisory at low severity or higher and scans the complete Git history for committed secrets. Reassess dependency and platform support on every update; do not waive a security advisory without an owner, expiry, compensating controls, and documented production approval.
