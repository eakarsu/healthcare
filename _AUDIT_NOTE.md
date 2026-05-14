# Audit Apply Notes — healthcare_salesforce

Source: `_AUDIT/reports/batch_10.md` § Substantive #13 healthcare_salesforce

## Original audit recommendations

Audit verdict: **SUBSTANTIVE** — 91 pages + 129 API routes. Already has the major AI features (treatment recs, prior-auth assistance, denial prediction, referral letters, risk strat, automated medical coding, drug interactions, no-show prediction, clinical scribe, ambient scribe).

### What's missing
- Telehealth/video consultation capability
- EHR interoperability (HL7 FHIR export/import)
- Real-time bed/OR management
- Pharmacy integration for prescription verification
- Radiology DICOM image viewer
- Predictive patient no-show with proactive outreach

### Custom feature ideas
- Automated prior auth (AI generates auth requests to insurers)
- Patient education generator
- Real-time population health analytics
- Revenue cycle automation agent
- Voice-to-chart scribe
- Telehealth + ambient AI

## Implemented this pass

**None.** This pass is backlog-only.

Reason: every "missing" item is either NEEDS-CREDS / external SDK (telehealth video providers, FHIR servers, DICOM viewers, pharmacy networks) or NEEDS-PRODUCT-DECISION (HIPAA scope for outreach automation, BAAs for vendor selection). The constraints disallow new SDKs and frontend changes, so adding usable telehealth, FHIR, or DICOM is out of scope. The codebase already has 129 AI routes covering the conversational and review use cases, including the prior-auth helper and education-content categories listed in the audit's custom-ideas section.

## Backlog (not implemented)

### Needs creds / external deps
- Video consultation (Twilio Video, Zoom Healthcare, Doxy.me).
- HL7/FHIR interop (Redox, Smile CDR, or direct FHIR endpoints).
- DICOM image viewer (OHIF, dwv).
- Pharmacy network integration (Surescripts, NCPDP).

### Needs product decision (HIPAA scope)
- Predictive no-show with proactive outreach — needs consent + channel selection (SMS/email/voice).
- Voice-to-chart scribe — needs ASR vendor + BAA decision.
- Real-time population health analytics — needs cohort definition + risk model selection.
- Revenue cycle automation agent — overlaps existing denial-prediction + billing-coder; needs scope.

### Needs schema/data model work
- Bed/OR management — not part of the current ambulatory-focused schema.
- Patient education generator — needs content repository + readability levelling.

## Categorisation

- MECHANICAL: none safely identified given audit's recommendations are all infrastructure-scale.
- NEEDS-CREDS: telehealth, FHIR, DICOM, pharmacy.
- NEEDS-PRODUCT-DECISION: predictive no-show outreach (HIPAA), scribe vendor, population-health cohorts, RCM agent scope.
- NEEDS-SCHEMA: bed/OR module, education content repository.

## Apply pass 3 (frontend)

**Action: LEFT-AS-IS** — Next.js App Router project; apply pass 2 added zero new endpoints (NEEDS-CREDS / NEEDS-PRODUCT-DECISION). The existing 91-page dashboard covers the existing 129 API routes. No new FE pages required. Idempotent.

## Apply pass 4 (mechanical backlog)

**Action: LEFT-AS-IS.** Substantive project (91 pages / 129 routes); no mechanical LLM-only backlog items remain.

Audit gaps (all non-mechanical):
- Telehealth video — NEEDS-CREDS (Twilio Video / Zoom Healthcare / Doxy.me + BAA).
- HL7/FHIR interop — NEEDS-CREDS (Redox / Smile CDR / direct FHIR endpoints).
- DICOM viewer — NEEDS-CREDS (OHIF / dwv with image-store credentials).
- Pharmacy network — NEEDS-CREDS (Surescripts / NCPDP).
- Predictive no-show with proactive outreach — NEEDS-PRODUCT-DECISION (HIPAA channel + consent).
- Voice-to-chart scribe — NEEDS-PRODUCT-DECISION (ASR vendor + BAA).
- Real-time population health analytics — NEEDS-PRODUCT-DECISION (cohort + risk model selection).
- Revenue cycle automation agent — overlaps existing denial-prediction / billing-coder; NEEDS-PRODUCT-DECISION on scope.
- Bed / OR management — NEEDS-SCHEMA (current schema is ambulatory-focused).
- Patient education generator — NEEDS-SCHEMA + NEEDS-PRODUCT-DECISION (content repo + readability levelling).

The existing 129-route surface already implements prior-auth assistance, denial prediction, clinical/ambient scribe, treatment recommendations, drug interaction checks, no-show prediction, and automated medical coding via Claude API helpers. Idempotent.
