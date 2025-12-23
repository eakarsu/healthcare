// FHIR R4 Interoperability Module
// Implements HL7 FHIR R4 resource transformations for healthcare data exchange

// FHIR R4 Resource Types
export type FHIRResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'Observation'
  | 'Condition'
  | 'AllergyIntolerance'
  | 'MedicationStatement'
  | 'DiagnosticReport'
  | 'Procedure'
  | 'Encounter'
  | 'Immunization'
  | 'DocumentReference'
  | 'ServiceRequest'

// Base FHIR Resource interface
interface FHIRResource {
  resourceType: FHIRResourceType
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
  }
}

// FHIR Patient Resource
export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient'
  identifier?: Array<{
    system: string
    value: string
    type?: { coding: Array<{ system: string; code: string; display: string }> }
  }>
  name: Array<{
    use?: string
    family: string
    given: string[]
    prefix?: string[]
    suffix?: string[]
  }>
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  telecom?: Array<{
    system: 'phone' | 'email' | 'fax'
    value: string
    use?: 'home' | 'work' | 'mobile'
  }>
  address?: Array<{
    use?: 'home' | 'work' | 'billing'
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  communication?: Array<{
    language: { coding: Array<{ system: string; code: string; display: string }> }
    preferred?: boolean
  }>
  generalPractitioner?: Array<{ reference: string; display?: string }>
}

// FHIR Observation Resource (for vitals, lab results)
export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation'
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled'
  category?: Array<{
    coding: Array<{ system: string; code: string; display: string }>
  }>
  code: {
    coding: Array<{ system: string; code: string; display: string }>
    text?: string
  }
  subject: { reference: string }
  effectiveDateTime?: string
  valueQuantity?: {
    value: number
    unit: string
    system?: string
    code?: string
  }
  valueString?: string
  valueCodeableConcept?: {
    coding: Array<{ system: string; code: string; display: string }>
  }
  interpretation?: Array<{
    coding: Array<{ system: string; code: string; display: string }>
  }>
  referenceRange?: Array<{
    low?: { value: number; unit: string }
    high?: { value: number; unit: string }
    text?: string
  }>
}

// FHIR Condition Resource
export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition'
  clinicalStatus: {
    coding: Array<{ system: string; code: string }>
  }
  verificationStatus?: {
    coding: Array<{ system: string; code: string }>
  }
  category?: Array<{
    coding: Array<{ system: string; code: string; display: string }>
  }>
  code: {
    coding: Array<{ system: string; code: string; display: string }>
    text?: string
  }
  subject: { reference: string }
  onsetDateTime?: string
  abatementDateTime?: string
  recordedDate?: string
}

// FHIR AllergyIntolerance Resource
export interface FHIRAllergyIntolerance extends FHIRResource {
  resourceType: 'AllergyIntolerance'
  clinicalStatus: {
    coding: Array<{ system: string; code: string }>
  }
  verificationStatus?: {
    coding: Array<{ system: string; code: string }>
  }
  type?: 'allergy' | 'intolerance'
  category?: Array<'food' | 'medication' | 'environment' | 'biologic'>
  criticality?: 'low' | 'high' | 'unable-to-assess'
  code: {
    coding: Array<{ system: string; code: string; display: string }>
    text?: string
  }
  patient: { reference: string }
  onsetDateTime?: string
  reaction?: Array<{
    manifestation: Array<{
      coding: Array<{ system: string; code: string; display: string }>
    }>
    severity?: 'mild' | 'moderate' | 'severe'
  }>
}

// FHIR MedicationStatement Resource
export interface FHIRMedicationStatement extends FHIRResource {
  resourceType: 'MedicationStatement'
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold' | 'unknown' | 'not-taken'
  medicationCodeableConcept: {
    coding: Array<{ system: string; code: string; display: string }>
    text?: string
  }
  subject: { reference: string }
  effectiveDateTime?: string
  effectivePeriod?: { start?: string; end?: string }
  dosage?: Array<{
    text?: string
    timing?: { code?: { text: string } }
    route?: { coding: Array<{ system: string; code: string; display: string }> }
    doseAndRate?: Array<{
      doseQuantity?: { value: number; unit: string }
    }>
  }>
}

// Transform local Patient to FHIR Patient
export function patientToFHIR(patient: {
  id: string
  mrn: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: Date
  gender: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  preferredLanguage?: string
}): FHIRPatient {
  const fhirPatient: FHIRPatient = {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
    },
    identifier: [
      {
        system: 'urn:oid:healthcare-practice-ai',
        value: patient.mrn,
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }]
        }
      }
    ],
    name: [{
      use: 'official',
      family: patient.lastName,
      given: patient.middleName
        ? [patient.firstName, patient.middleName]
        : [patient.firstName]
    }],
    gender: mapGenderToFHIR(patient.gender),
    birthDate: patient.dateOfBirth.toISOString().split('T')[0],
    telecom: [],
    address: []
  }

  // Add contact info
  if (patient.phone) {
    fhirPatient.telecom!.push({
      system: 'phone',
      value: patient.phone,
      use: 'home'
    })
  }
  if (patient.mobile) {
    fhirPatient.telecom!.push({
      system: 'phone',
      value: patient.mobile,
      use: 'mobile'
    })
  }
  if (patient.email) {
    fhirPatient.telecom!.push({
      system: 'email',
      value: patient.email
    })
  }

  // Add address
  if (patient.address || patient.city || patient.state || patient.zip) {
    fhirPatient.address!.push({
      use: 'home',
      line: patient.address ? [patient.address] : undefined,
      city: patient.city,
      state: patient.state,
      postalCode: patient.zip,
      country: 'US'
    })
  }

  // Add language preference
  if (patient.preferredLanguage) {
    fhirPatient.communication = [{
      language: {
        coding: [{
          system: 'urn:ietf:bcp:47',
          code: patient.preferredLanguage,
          display: getLanguageDisplay(patient.preferredLanguage)
        }]
      },
      preferred: true
    }]
  }

  return fhirPatient
}

// Transform FHIR Patient to local format
export function fhirToPatient(fhirPatient: FHIRPatient): {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: Date
  gender: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  mrn?: string
} {
  const name = fhirPatient.name?.[0]
  const homePhone = fhirPatient.telecom?.find(t => t.system === 'phone' && t.use === 'home')
  const mobilePhone = fhirPatient.telecom?.find(t => t.system === 'phone' && t.use === 'mobile')
  const email = fhirPatient.telecom?.find(t => t.system === 'email')
  const address = fhirPatient.address?.find(a => a.use === 'home')
  const mrn = fhirPatient.identifier?.find(i =>
    i.type?.coding?.some(c => c.code === 'MR')
  )?.value

  return {
    firstName: name?.given?.[0] || '',
    lastName: name?.family || '',
    middleName: name?.given?.[1],
    dateOfBirth: fhirPatient.birthDate ? new Date(fhirPatient.birthDate) : new Date(),
    gender: mapFHIRToGender(fhirPatient.gender),
    email: email?.value,
    phone: homePhone?.value,
    mobile: mobilePhone?.value,
    address: address?.line?.[0],
    city: address?.city,
    state: address?.state,
    zip: address?.postalCode,
    mrn
  }
}

// Transform local Condition to FHIR Condition
export function conditionToFHIR(condition: {
  id: string
  patientId: string
  icdCode?: string
  name: string
  status: string
  onsetDate?: Date
  resolvedDate?: Date
}): FHIRCondition {
  return {
    resourceType: 'Condition',
    id: condition.id,
    meta: {
      lastUpdated: new Date().toISOString()
    },
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: mapConditionStatus(condition.status)
      }]
    },
    verificationStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
        code: 'confirmed'
      }]
    },
    code: {
      coding: condition.icdCode ? [{
        system: 'http://hl7.org/fhir/sid/icd-10-cm',
        code: condition.icdCode,
        display: condition.name
      }] : [],
      text: condition.name
    },
    subject: { reference: `Patient/${condition.patientId}` },
    onsetDateTime: condition.onsetDate?.toISOString(),
    abatementDateTime: condition.resolvedDate?.toISOString()
  }
}

// Transform local Allergy to FHIR AllergyIntolerance
export function allergyToFHIR(allergy: {
  id: string
  patientId: string
  allergen: string
  reaction?: string
  severity: string
  status: string
  onsetDate?: Date
}): FHIRAllergyIntolerance {
  return {
    resourceType: 'AllergyIntolerance',
    id: allergy.id,
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
        code: allergy.status === 'active' ? 'active' : 'inactive'
      }]
    },
    criticality: mapSeverityToCriticality(allergy.severity),
    code: {
      text: allergy.allergen
    },
    patient: { reference: `Patient/${allergy.patientId}` },
    onsetDateTime: allergy.onsetDate?.toISOString(),
    reaction: allergy.reaction ? [{
      manifestation: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: '418290006',
          display: allergy.reaction
        }]
      }],
      severity: mapSeverity(allergy.severity)
    }] : undefined
  }
}

// Transform local Medication to FHIR MedicationStatement
export function medicationToFHIR(medication: {
  id: string
  patientId: string
  name: string
  dosage?: string
  frequency?: string
  route?: string
  status: string
  startDate?: Date
  endDate?: Date
}): FHIRMedicationStatement {
  return {
    resourceType: 'MedicationStatement',
    id: medication.id,
    status: medication.status === 'active' ? 'active' : 'completed',
    medicationCodeableConcept: {
      text: medication.name
    },
    subject: { reference: `Patient/${medication.patientId}` },
    effectivePeriod: {
      start: medication.startDate?.toISOString(),
      end: medication.endDate?.toISOString()
    },
    dosage: medication.dosage ? [{
      text: `${medication.dosage} ${medication.frequency || ''} ${medication.route || ''}`.trim(),
      timing: medication.frequency ? { code: { text: medication.frequency } } : undefined,
      route: medication.route ? {
        coding: [{
          system: 'http://snomed.info/sct',
          code: getRouteCode(medication.route),
          display: medication.route
        }]
      } : undefined
    }] : undefined
  }
}

// Transform vital signs to FHIR Observation
export function vitalsToFHIR(vitals: {
  id: string
  patientId: string
  encounterId: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  recordedAt: Date
}): FHIRObservation[] {
  const observations: FHIRObservation[] = []
  const baseRef = { reference: `Patient/${vitals.patientId}` }
  const effectiveDateTime = vitals.recordedAt.toISOString()

  if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-bp`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }] },
      subject: baseRef,
      effectiveDateTime,
      valueString: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
    })
  }

  if (vitals.heartRate) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-hr`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
      subject: baseRef,
      effectiveDateTime,
      valueQuantity: { value: vitals.heartRate, unit: 'beats/minute', system: 'http://unitsofmeasure.org', code: '/min' }
    })
  }

  if (vitals.temperature) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-temp`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }] },
      subject: baseRef,
      effectiveDateTime,
      valueQuantity: { value: Number(vitals.temperature), unit: 'F', system: 'http://unitsofmeasure.org', code: '[degF]' }
    })
  }

  if (vitals.oxygenSaturation) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-spo2`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' }] },
      subject: baseRef,
      effectiveDateTime,
      valueQuantity: { value: vitals.oxygenSaturation, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
    })
  }

  if (vitals.weight) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-weight`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '29463-7', display: 'Body weight' }] },
      subject: baseRef,
      effectiveDateTime,
      valueQuantity: { value: Number(vitals.weight), unit: 'lb', system: 'http://unitsofmeasure.org', code: '[lb_av]' }
    })
  }

  if (vitals.height) {
    observations.push({
      resourceType: 'Observation',
      id: `${vitals.id}-height`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '8302-2', display: 'Body height' }] },
      subject: baseRef,
      effectiveDateTime,
      valueQuantity: { value: Number(vitals.height), unit: 'in', system: 'http://unitsofmeasure.org', code: '[in_i]' }
    })
  }

  return observations
}

// Helper functions
function mapGenderToFHIR(gender: string): 'male' | 'female' | 'other' | 'unknown' {
  switch (gender.toUpperCase()) {
    case 'MALE': return 'male'
    case 'FEMALE': return 'female'
    case 'OTHER': return 'other'
    default: return 'unknown'
  }
}

function mapFHIRToGender(gender?: string): string {
  switch (gender) {
    case 'male': return 'MALE'
    case 'female': return 'FEMALE'
    case 'other': return 'OTHER'
    default: return 'UNKNOWN'
  }
}

function mapConditionStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'active': return 'active'
    case 'resolved': return 'resolved'
    case 'chronic': return 'active'
    case 'inactive': return 'inactive'
    default: return 'active'
  }
}

function mapSeverityToCriticality(severity: string): 'low' | 'high' | 'unable-to-assess' {
  switch (severity.toUpperCase()) {
    case 'MILD': return 'low'
    case 'MODERATE': return 'low'
    case 'SEVERE': return 'high'
    case 'LIFE_THREATENING': return 'high'
    default: return 'unable-to-assess'
  }
}

function mapSeverity(severity: string): 'mild' | 'moderate' | 'severe' {
  switch (severity.toUpperCase()) {
    case 'MILD': return 'mild'
    case 'MODERATE': return 'moderate'
    case 'SEVERE': return 'severe'
    case 'LIFE_THREATENING': return 'severe'
    default: return 'moderate'
  }
}

function getLanguageDisplay(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'vi': 'Vietnamese',
    'ko': 'Korean',
    'ar': 'Arabic'
  }
  return languages[code] || code
}

function getRouteCode(route: string): string {
  const routes: Record<string, string> = {
    'Oral': '26643006',
    'IV': '47625008',
    'IM': '78421000',
    'Topical': '6064005',
    'Subcutaneous': '34206005',
    'Inhalation': '18679011000001101'
  }
  return routes[route] || '26643006'
}

// FHIR Bundle creation for batch operations
export function createFHIRBundle(
  type: 'transaction' | 'batch' | 'collection',
  entries: Array<{ resource: FHIRResource; request?: { method: string; url: string } }>
): {
  resourceType: 'Bundle'
  type: string
  entry: Array<{ resource: FHIRResource; request?: { method: string; url: string } }>
} {
  return {
    resourceType: 'Bundle',
    type,
    entry: entries
  }
}

// FHIR Client for external connections
export class FHIRClient {
  private baseUrl: string
  private accessToken?: string

  constructor(baseUrl: string, accessToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.accessToken = accessToken
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json'
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`FHIR request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCapabilityStatement() {
    return this.request<{ resourceType: string; fhirVersion: string }>('GET', '/metadata')
  }

  async getPatient(id: string): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('GET', `/Patient/${id}`)
  }

  async searchPatients(params: Record<string, string>): Promise<{ entry: Array<{ resource: FHIRPatient }> }> {
    const searchParams = new URLSearchParams(params)
    return this.request('GET', `/Patient?${searchParams}`)
  }

  async createPatient(patient: FHIRPatient): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('POST', '/Patient', patient)
  }

  async updatePatient(id: string, patient: FHIRPatient): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('PUT', `/Patient/${id}`, patient)
  }

  async getObservations(patientId: string, category?: string): Promise<{ entry: Array<{ resource: FHIRObservation }> }> {
    const params = new URLSearchParams({ patient: patientId })
    if (category) params.set('category', category)
    return this.request('GET', `/Observation?${params}`)
  }

  async createObservation(observation: FHIRObservation): Promise<FHIRObservation> {
    return this.request<FHIRObservation>('POST', '/Observation', observation)
  }

  async submitBundle(bundle: ReturnType<typeof createFHIRBundle>) {
    return this.request('POST', '/', bundle)
  }
}
