import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateClinicalDraft, fhirProvenance, hasValidConsent, matchPatientIdentity, projectPatientFields } from '../src/lib/clinical-governance'
import { decrypt, encrypt } from '../src/lib/encryption'
import { validateRuntimeConfig } from '../src/lib/runtime-config'

test('identity matching accepts an MRN and escalates ambiguous demographics', () => {
  const incoming = { firstName: 'Ana', lastName: 'Lee', dateOfBirth: new Date('1980-01-01') }
  const candidates = [
    { id: 'a', mrn: '1', ...incoming },
    { id: 'b', mrn: '2', ...incoming },
  ]
  assert.equal(matchPatientIdentity({ ...incoming, mrn: '1' }, candidates).decision, 'MATCH')
  assert.equal(matchPatientIdentity(incoming, candidates).decision, 'MANUAL_REVIEW')
})

test('expired or revoked consent is rejected', () => {
  const now = new Date('2026-07-20T12:00:00Z')
  assert.equal(hasValidConsent([{ type: 'RELEASE_OF_INFORMATION', status: 'signed', signedDate: new Date('2026-01-01'), expiresDate: new Date('2026-07-01') }], 'RELEASE_OF_INFORMATION', now), false)
  assert.equal(hasValidConsent([{ type: 'RELEASE_OF_INFORMATION', status: 'signed', signedDate: new Date('2026-01-01'), expiresDate: null }], 'RELEASE_OF_INFORMATION', now), true)
})

test('allergy conflict and critical vitals force escalation', () => {
  const result = evaluateClinicalDraft({
    allergies: [{ allergen: 'penicillin', severity: 'SEVERE' }], medications: [{ name: 'metformin' }], conditions: [],
    proposedMedications: ['penicillin V'], vitals: { oxygenSaturation: 86 }, subjective: 'dyspnea', assessment: 'possible infection', plan: 'start therapy',
  })
  assert.equal(result.disposition, 'ESCALATE')
  assert.deepEqual(result.blockers.map(x => x.code), ['ALLERGY_CONTRAINDICATION', 'CRITICAL_OXYGEN_SATURATION'])
})

test('missing handoff data remains a review blocker and never auto-signs', () => {
  const result = evaluateClinicalDraft({ allergies: [], medications: [], conditions: [] })
  assert.equal(result.requiresClinicianReview, true)
  assert.equal(result.blockers[0].code, 'MISSING_CORE_NOTE_DATA')
})

test('field projection limits non-clinical roles', () => {
  const projected = projectPatientFields({ id: '1', mrn: 'm', firstName: 'A', ssn: 'secret', bloodType: 'O' }, 'RECEPTIONIST')
  assert.equal(projected.firstName, 'A')
  assert.equal('ssn' in projected, false)
  assert.equal('bloodType' in projected, false)
})

test('provenance requires TLS', () => {
  assert.throws(() => fhirProvenance('http://ehr.test', 'Patient'), /HTTPS/)
  assert.equal(fhirProvenance('https://ehr.test', 'Patient', 'p1').resourceId, 'p1')
})

test('production runtime configuration rejects placeholders, wildcard CORS, and HTTP', () => {
  assert.throws(() => validateRuntimeConfig({
    NODE_ENV: 'production', NEXTAUTH_SECRET: 'your-secret-that-is-at-least-32-characters',
    NEXTAUTH_URL: 'http://app.test', CORS_ALLOWED_ORIGINS: '*',
  } as NodeJS.ProcessEnv), /Invalid runtime configuration/)
  assert.doesNotThrow(() => validateRuntimeConfig({
    NODE_ENV: 'production', NEXTAUTH_SECRET: 'a-real-non-placeholder-secret-with-32-chars',
    NEXTAUTH_URL: 'https://app.test', CORS_ALLOWED_ORIGINS: 'https://app.test',
    DATABASE_URL: 'postgresql://healthcare:opaque@db.internal/healthcare',
    ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
    FHIR_ALLOWED_HOSTS: 'fhir.partner.test',
  } as NodeJS.ProcessEnv))
})

test('regulated-data encryption authenticates ciphertext and rejects weak keys', () => {
  const previousKey = process.env.ENCRYPTION_KEY
  try {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')
    const ciphertext = encrypt('sensitive value')
    assert.equal(decrypt(ciphertext), 'sensitive value')
    const corrupted = `${ciphertext.slice(0, -1)}${ciphertext.endsWith('0') ? '1' : '0'}`
    assert.throws(() => decrypt(corrupted))
    process.env.ENCRYPTION_KEY = Buffer.alloc(16, 7).toString('base64')
    assert.throws(() => encrypt('sensitive value'), /exactly 32 random bytes/)
  } finally {
    if (previousKey === undefined) delete process.env.ENCRYPTION_KEY
    else process.env.ENCRYPTION_KEY = previousKey
  }
})
