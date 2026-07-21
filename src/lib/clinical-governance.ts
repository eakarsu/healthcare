export type ClinicalRole = 'ADMIN' | 'MANAGER' | 'PROVIDER' | 'NURSE' | 'RECEPTIONIST' | 'BILLER'

export type IdentityCandidate = {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  email?: string | null
  phone?: string | null
}

export type IncomingIdentity = {
  mrn?: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  email?: string
  phone?: string
}

const normalized = (value?: string | null) => (value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
const day = (value: Date) => value.toISOString().slice(0, 10)

export function matchPatientIdentity(incoming: IncomingIdentity, candidates: IdentityCandidate[]) {
  const scored = candidates.map(candidate => {
    if (incoming.mrn && normalized(incoming.mrn) === normalized(candidate.mrn)) {
      return { patientId: candidate.id, score: 100, evidence: ['mrn'] }
    }
    let score = 0
    const evidence: string[] = []
    if (normalized(incoming.firstName) === normalized(candidate.firstName) && normalized(incoming.lastName) === normalized(candidate.lastName)) {
      score += 45; evidence.push('name')
    }
    if (day(incoming.dateOfBirth) === day(candidate.dateOfBirth)) { score += 40; evidence.push('birthDate') }
    if (incoming.email && normalized(incoming.email) === normalized(candidate.email)) { score += 10; evidence.push('email') }
    if (incoming.phone && normalized(incoming.phone) === normalized(candidate.phone)) { score += 10; evidence.push('phone') }
    return { patientId: candidate.id, score, evidence }
  }).filter(result => result.score >= 70).sort((a, b) => b.score - a.score || a.patientId.localeCompare(b.patientId))

  if (!scored.length) return { decision: 'NO_MATCH' as const, candidates: [] }
  if (scored.length > 1 && scored[0].score === scored[1].score) return { decision: 'MANUAL_REVIEW' as const, candidates: scored }
  if (scored[0].score < 85) return { decision: 'MANUAL_REVIEW' as const, candidates: scored }
  return { decision: 'MATCH' as const, patientId: scored[0].patientId, candidates: scored }
}

export function hasValidConsent(consents: Array<{ type: string; status: string; signedDate: Date; expiresDate?: Date | null }>, type: string, at = new Date()) {
  return consents.some(consent => consent.type === type && consent.status === 'signed' && consent.signedDate <= at && (!consent.expiresDate || consent.expiresDate > at))
}

export type SafetyInput = {
  allergies: Array<{ allergen: string; severity: string }>
  medications: Array<{ name: string }>
  conditions: Array<{ name: string }>
  proposedMedications?: string[]
  vitals?: { systolic?: number; diastolic?: number; heartRate?: number; oxygenSaturation?: number }
  subjective?: string
  assessment?: string
  plan?: string
}

export function evaluateClinicalDraft(input: SafetyInput) {
  const blockers: Array<{ code: string; detail: string }> = []
  const warnings: Array<{ code: string; detail: string }> = []
  if (!input.subjective?.trim() || !input.assessment?.trim() || !input.plan?.trim()) {
    blockers.push({ code: 'MISSING_CORE_NOTE_DATA', detail: 'Subjective, assessment, and plan require clinician completion.' })
  }
  for (const proposed of input.proposedMedications || []) {
    const medication = normalized(proposed)
    for (const allergy of input.allergies) {
      const allergen = normalized(allergy.allergen)
      if (allergen && medication.includes(allergen)) {
        blockers.push({ code: 'ALLERGY_CONTRAINDICATION', detail: `${proposed} conflicts with documented ${allergy.severity.toLowerCase()} allergy.` })
      }
    }
  }
  const vitals = input.vitals || {}
  if (vitals.systolic !== undefined && (vitals.systolic >= 180 || vitals.systolic <= 80)) blockers.push({ code: 'CRITICAL_BLOOD_PRESSURE', detail: 'Critical systolic value requires immediate clinical review.' })
  if (vitals.diastolic !== undefined && (vitals.diastolic >= 120 || vitals.diastolic <= 50)) blockers.push({ code: 'CRITICAL_BLOOD_PRESSURE', detail: 'Critical diastolic value requires immediate clinical review.' })
  if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 90) blockers.push({ code: 'CRITICAL_OXYGEN_SATURATION', detail: 'Low oxygen saturation requires escalation.' })
  if (vitals.heartRate !== undefined && (vitals.heartRate < 40 || vitals.heartRate > 140)) blockers.push({ code: 'CRITICAL_HEART_RATE', detail: 'Critical heart rate requires escalation.' })
  if (!input.allergies.length) warnings.push({ code: 'ALLERGY_STATUS_UNCONFIRMED', detail: 'Allergy status must be reconciled before signing.' })
  if (!input.medications.length) warnings.push({ code: 'MEDICATION_LIST_UNCONFIRMED', detail: 'Medication list must be reconciled before signing.' })
  return {
    disposition: blockers.length ? 'ESCALATE' as const : 'CLINICIAN_REVIEW' as const,
    blockers, warnings, requiresClinicianReview: true,
  }
}

const FIELD_ACCESS: Record<ClinicalRole, Set<string> | '*'> = {
  ADMIN: '*', MANAGER: '*', PROVIDER: '*', NURSE: '*',
  RECEPTIONIST: new Set(['id', 'mrn', 'firstName', 'lastName', 'preferredName', 'dateOfBirth', 'email', 'phone', 'mobile', 'address', 'city', 'state', 'zip', 'preferredLanguage']),
  BILLER: new Set(['id', 'mrn', 'firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zip']),
}

export function projectPatientFields<T extends Record<string, unknown>>(patient: T, role: ClinicalRole): Partial<T> {
  const allowed = FIELD_ACCESS[role]
  if (allowed === '*') return { ...patient }
  return Object.fromEntries(Object.entries(patient).filter(([key]) => allowed.has(key))) as Partial<T>
}

export function fhirProvenance(source: string, resourceType: string, resourceId?: string, versionId?: string) {
  if (!source.startsWith('https://')) throw new Error('FHIR provenance source must use HTTPS')
  return { source, resourceType, resourceId: resourceId || null, versionId: versionId || null, receivedAt: new Date().toISOString() }
}
