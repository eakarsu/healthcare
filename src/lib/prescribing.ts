// E-Prescribing (EPCS) Module
// Supports electronic prescribing including controlled substances

import OpenAI from 'openai'

const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10

const openai = hasValidApiKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Healthcare Practice AI',
  },
}) : null

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

// Drug information from database
export interface Drug {
  ndcCode: string
  rxNormCode?: string
  brandName: string
  genericName: string
  strength?: string
  form?: string
  route?: string
  isControlled: boolean
  scheduleClass?: 'II' | 'III' | 'IV' | 'V'
  interactions?: DrugInteraction[]
}

export interface DrugInteraction {
  interactingDrug: string
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CONTRAINDICATED'
  description: string
  managementRecommendation: string
}

// Prescription data
export interface PrescriptionData {
  patientId: string
  providerId: string
  encounterId?: string
  drug: {
    name: string
    code?: string
    strength?: string
    form?: string
  }
  dosage: string
  frequency: string
  route: string
  duration?: string
  quantity: number
  quantityUnit: string
  refills: number
  dispenseAsWritten: boolean
  indication?: string
  notes?: string
  pharmacyId?: string
}

// Search for drugs by name
export async function searchDrugs(
  query: string,
  options?: {
    includeGeneric?: boolean
    formularyOnly?: boolean
    limit?: number
  }
): Promise<Drug[]> {
  // In production, this would query a drug database (FDB, Medi-Span, etc.)
  // Mock implementation for common medications
  const mockDrugs: Drug[] = [
    {
      ndcCode: '00002-4112-30',
      rxNormCode: '197361',
      brandName: 'Lipitor',
      genericName: 'Atorvastatin',
      strength: '10mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: false
    },
    {
      ndcCode: '00006-0749-31',
      rxNormCode: '311989',
      brandName: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '10mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: false
    },
    {
      ndcCode: '00591-5503-01',
      rxNormCode: '197318',
      brandName: 'Metformin',
      genericName: 'Metformin HCl',
      strength: '500mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: false
    },
    {
      ndcCode: '00093-3109-01',
      rxNormCode: '197516',
      brandName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      strength: '500mg',
      form: 'Capsule',
      route: 'Oral',
      isControlled: false
    },
    {
      ndcCode: '00406-0512-01',
      rxNormCode: '864706',
      brandName: 'Oxycodone',
      genericName: 'Oxycodone HCl',
      strength: '5mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: true,
      scheduleClass: 'II'
    },
    {
      ndcCode: '00591-0657-01',
      rxNormCode: '197591',
      brandName: 'Alprazolam',
      genericName: 'Alprazolam',
      strength: '0.5mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: true,
      scheduleClass: 'IV'
    },
    {
      ndcCode: '00378-4215-01',
      rxNormCode: '198108',
      brandName: 'Tramadol',
      genericName: 'Tramadol HCl',
      strength: '50mg',
      form: 'Tablet',
      route: 'Oral',
      isControlled: true,
      scheduleClass: 'IV'
    },
    {
      ndcCode: '00078-0234-05',
      rxNormCode: '197807',
      brandName: 'Gabapentin',
      genericName: 'Gabapentin',
      strength: '300mg',
      form: 'Capsule',
      route: 'Oral',
      isControlled: false
    }
  ]

  const lowerQuery = query.toLowerCase()
  return mockDrugs.filter(drug =>
    drug.brandName.toLowerCase().includes(lowerQuery) ||
    drug.genericName.toLowerCase().includes(lowerQuery)
  ).slice(0, options?.limit || 20)
}

// Check for drug interactions
export async function checkDrugInteractions(
  newDrugCode: string,
  currentMedications: Array<{ name: string; code?: string }>
): Promise<{
  hasInteractions: boolean
  interactions: DrugInteraction[]
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
}> {
  if (!openai || currentMedications.length === 0) {
    // Return mock interaction check
    return {
      hasInteractions: false,
      interactions: [],
      overallRisk: 'LOW',
      recommendations: ['No significant interactions identified with current medications']
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a clinical pharmacist checking drug interactions.
Analyze potential interactions between the new medication and current medications.
Consider pharmacokinetic and pharmacodynamic interactions.

Return ONLY a JSON object:
{
  "hasInteractions": boolean,
  "interactions": [
    {
      "interactingDrug": "Drug name",
      "severity": "MINOR" | "MODERATE" | "MAJOR" | "CONTRAINDICATED",
      "description": "Brief description of interaction",
      "managementRecommendation": "How to manage"
    }
  ],
  "overallRisk": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`
        },
        {
          role: 'user',
          content: `Check interactions for new drug code ${newDrugCode} with current medications:
${currentMedications.map(m => `- ${m.name} (${m.code || 'no code'})`).join('\n')}`
        }
      ],
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid format')

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Drug interaction check error:', error)
    return {
      hasInteractions: false,
      interactions: [],
      overallRisk: 'LOW',
      recommendations: ['Unable to verify interactions - manual review recommended']
    }
  }
}

// Check patient allergies against drug
export async function checkAllergyConflict(
  drugName: string,
  allergies: Array<{ allergen: string; severity: string }>
): Promise<{
  hasConflict: boolean
  conflictingAllergies: Array<{
    allergen: string
    severity: string
    crossReactivityRisk: 'LOW' | 'MODERATE' | 'HIGH'
  }>
  recommendation: string
}> {
  if (allergies.length === 0) {
    return {
      hasConflict: false,
      conflictingAllergies: [],
      recommendation: 'No documented allergies'
    }
  }

  // Check for common cross-reactivities
  const penicillinAllergies = allergies.filter(a =>
    a.allergen.toLowerCase().includes('penicillin') ||
    a.allergen.toLowerCase().includes('amoxicillin')
  )

  const drugLower = drugName.toLowerCase()

  // Penicillin cross-reactivity check
  if (penicillinAllergies.length > 0) {
    const penicillinDrugs = ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'piperacillin']
    const cephalosporins = ['cephalexin', 'cefdinir', 'ceftriaxone', 'cefuroxime', 'cefazolin']

    if (penicillinDrugs.some(d => drugLower.includes(d))) {
      return {
        hasConflict: true,
        conflictingAllergies: penicillinAllergies.map(a => ({
          allergen: a.allergen,
          severity: a.severity,
          crossReactivityRisk: 'HIGH' as const
        })),
        recommendation: 'CONTRAINDICATED: Patient has documented penicillin allergy'
      }
    }

    if (cephalosporins.some(d => drugLower.includes(d))) {
      return {
        hasConflict: true,
        conflictingAllergies: penicillinAllergies.map(a => ({
          allergen: a.allergen,
          severity: a.severity,
          crossReactivityRisk: 'MODERATE' as const
        })),
        recommendation: 'CAUTION: Cross-reactivity possible with penicillin allergy (1-2% risk)'
      }
    }
  }

  // Direct allergy match
  const directMatch = allergies.find(a =>
    drugLower.includes(a.allergen.toLowerCase()) ||
    a.allergen.toLowerCase().includes(drugLower.split(' ')[0])
  )

  if (directMatch) {
    return {
      hasConflict: true,
      conflictingAllergies: [{
        allergen: directMatch.allergen,
        severity: directMatch.severity,
        crossReactivityRisk: 'HIGH'
      }],
      recommendation: `CONTRAINDICATED: Patient has documented allergy to ${directMatch.allergen}`
    }
  }

  return {
    hasConflict: false,
    conflictingAllergies: [],
    recommendation: 'No allergy conflicts identified'
  }
}

// Calculate dosing based on patient factors
export async function calculateDosing(
  drugName: string,
  patientFactors: {
    age: number
    weight?: number // kg
    renalFunction?: number // eGFR
    hepaticFunction?: 'NORMAL' | 'MILD_IMPAIRMENT' | 'MODERATE_IMPAIRMENT' | 'SEVERE_IMPAIRMENT'
    indication: string
  }
): Promise<{
  recommendedDose: string
  frequency: string
  duration?: string
  adjustmentReason?: string
  warnings: string[]
}> {
  // Standard dosing with basic adjustments
  // In production, use clinical decision support database

  const warnings: string[] = []

  // Pediatric/Geriatric warnings
  if (patientFactors.age < 18) {
    warnings.push('Verify pediatric dosing appropriateness')
  }
  if (patientFactors.age > 65) {
    warnings.push('Consider reduced dose in elderly patients')
  }

  // Renal dosing adjustments
  if (patientFactors.renalFunction && patientFactors.renalFunction < 60) {
    warnings.push(`Renal impairment (eGFR: ${patientFactors.renalFunction}) - verify renal dosing`)
  }

  // Hepatic function warnings
  if (patientFactors.hepaticFunction && patientFactors.hepaticFunction !== 'NORMAL') {
    warnings.push(`Hepatic impairment - consider dose reduction`)
  }

  // Default response
  return {
    recommendedDose: 'See package insert for standard dosing',
    frequency: 'As directed',
    warnings
  }
}

// Generate prescription SIG (directions)
export function generateSig(prescription: {
  dosage: string
  frequency: string
  route: string
  duration?: string
  additionalInstructions?: string
}): string {
  const parts: string[] = []

  // Route
  const routeMap: Record<string, string> = {
    'Oral': 'Take',
    'Topical': 'Apply',
    'Inhalation': 'Inhale',
    'Sublingual': 'Dissolve under tongue',
    'IV': 'Inject intravenously',
    'IM': 'Inject intramuscularly',
    'Subcutaneous': 'Inject subcutaneously',
    'Rectal': 'Insert rectally',
    'Ophthalmic': 'Instill in eye(s)',
    'Otic': 'Instill in ear(s)'
  }

  parts.push(routeMap[prescription.route] || 'Take')
  parts.push(prescription.dosage)

  // Frequency
  const frequencyMap: Record<string, string> = {
    'QD': 'once daily',
    'BID': 'twice daily',
    'TID': 'three times daily',
    'QID': 'four times daily',
    'Q4H': 'every 4 hours',
    'Q6H': 'every 6 hours',
    'Q8H': 'every 8 hours',
    'Q12H': 'every 12 hours',
    'PRN': 'as needed',
    'QHS': 'at bedtime',
    'QAM': 'every morning',
    'QPM': 'every evening',
    'Weekly': 'once weekly'
  }

  parts.push(frequencyMap[prescription.frequency] || prescription.frequency)

  // Duration
  if (prescription.duration) {
    parts.push(`for ${prescription.duration}`)
  }

  // Additional instructions
  if (prescription.additionalInstructions) {
    parts.push(`- ${prescription.additionalInstructions}`)
  }

  return parts.join(' ')
}

// EPCS (Electronic Prescribing for Controlled Substances) validation
export interface EPCSValidation {
  isValid: boolean
  requirements: Array<{
    requirement: string
    status: 'MET' | 'NOT_MET' | 'PENDING'
    details?: string
  }>
  canPrescribe: boolean
  blockers: string[]
}

export async function validateEPCSRequirements(
  providerId: string,
  providerDEA: string | null,
  scheduleClass: 'II' | 'III' | 'IV' | 'V'
): Promise<EPCSValidation> {
  const requirements: EPCSValidation['requirements'] = []
  const blockers: string[] = []

  // DEA number validation
  if (!providerDEA) {
    requirements.push({
      requirement: 'Valid DEA registration',
      status: 'NOT_MET',
      details: 'Provider does not have a DEA number on file'
    })
    blockers.push('Missing DEA number')
  } else {
    // Basic DEA format validation
    const deaRegex = /^[A-Z]{2}\d{7}$/
    if (!deaRegex.test(providerDEA)) {
      requirements.push({
        requirement: 'Valid DEA registration',
        status: 'NOT_MET',
        details: 'DEA number format is invalid'
      })
      blockers.push('Invalid DEA number format')
    } else {
      requirements.push({
        requirement: 'Valid DEA registration',
        status: 'MET',
        details: `DEA: ${providerDEA}`
      })
    }
  }

  // Two-factor authentication requirement
  requirements.push({
    requirement: 'Two-factor authentication enabled',
    status: 'PENDING',
    details: 'Provider must complete 2FA to sign controlled substance prescriptions'
  })

  // Identity proofing
  requirements.push({
    requirement: 'Identity proofing completed',
    status: 'PENDING',
    details: 'Initial identity verification required for EPCS'
  })

  // Schedule II additional requirements
  if (scheduleClass === 'II') {
    requirements.push({
      requirement: 'Schedule II prescribing authority',
      status: providerDEA ? 'MET' : 'NOT_MET',
      details: 'Additional requirements apply for Schedule II substances'
    })
    if (!providerDEA) {
      blockers.push('Cannot prescribe Schedule II without valid DEA')
    }
  }

  return {
    isValid: blockers.length === 0,
    requirements,
    canPrescribe: blockers.length === 0,
    blockers
  }
}

// Pharmacy search (would connect to Surescripts in production)
export async function searchPharmacies(
  location: { zip?: string; city?: string; state?: string },
  options?: {
    acceptsEpcs?: boolean
    is24Hour?: boolean
    radius?: number // miles
  }
): Promise<Array<{
  id: string
  npi: string
  ncpdpId?: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax?: string
  acceptsEpcs: boolean
  is24Hour: boolean
  distance?: number
}>> {
  // Mock pharmacy data
  return [
    {
      id: 'pharm-1',
      npi: '1234567890',
      ncpdpId: '1234567',
      name: 'CVS Pharmacy #1234',
      address: '123 Main Street',
      city: location.city || 'New York',
      state: location.state || 'NY',
      zip: location.zip || '10001',
      phone: '(212) 555-0100',
      fax: '(212) 555-0101',
      acceptsEpcs: true,
      is24Hour: true,
      distance: 0.5
    },
    {
      id: 'pharm-2',
      npi: '2345678901',
      ncpdpId: '2345678',
      name: 'Walgreens #5678',
      address: '456 Oak Avenue',
      city: location.city || 'New York',
      state: location.state || 'NY',
      zip: location.zip || '10002',
      phone: '(212) 555-0200',
      fax: '(212) 555-0201',
      acceptsEpcs: true,
      is24Hour: false,
      distance: 1.2
    },
    {
      id: 'pharm-3',
      npi: '3456789012',
      name: 'Community Pharmacy',
      address: '789 Elm Street',
      city: location.city || 'New York',
      state: location.state || 'NY',
      zip: location.zip || '10003',
      phone: '(212) 555-0300',
      acceptsEpcs: false,
      is24Hour: false,
      distance: 2.0
    }
  ]
}

// Transmit prescription (would use Surescripts NCPDP SCRIPT in production)
export async function transmitPrescription(
  prescription: {
    rxNumber: string
    drug: Drug
    sig: string
    quantity: number
    refills: number
    dispenseAsWritten: boolean
    patient: {
      firstName: string
      lastName: string
      dateOfBirth: string
      address: string
      phone: string
    }
    provider: {
      npi: string
      deaNumber?: string
      firstName: string
      lastName: string
      phone: string
    }
    pharmacy: {
      npi: string
      ncpdpId?: string
      name: string
    }
  },
  method: 'ELECTRONIC' | 'FAX' | 'PRINT'
): Promise<{
  success: boolean
  transmissionId?: string
  status: string
  errorMessage?: string
}> {
  // Mock transmission - in production, integrate with Surescripts
  if (method === 'ELECTRONIC') {
    // Simulate Surescripts transmission
    return {
      success: true,
      transmissionId: `SURE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'TRANSMITTED'
    }
  } else if (method === 'FAX') {
    // Simulate fax transmission
    return {
      success: true,
      transmissionId: `FAX-${Date.now()}`,
      status: 'QUEUED'
    }
  } else {
    // Print returns ready to print
    return {
      success: true,
      status: 'READY_TO_PRINT'
    }
  }
}

// PDMP (Prescription Drug Monitoring Program) check
export async function checkPDMP(
  patientInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    state: string
  }
): Promise<{
  checked: boolean
  lastChecked?: Date
  alerts: Array<{
    type: 'MULTIPLE_PRESCRIBERS' | 'MULTIPLE_PHARMACIES' | 'HIGH_QUANTITY' | 'EARLY_REFILL' | 'OVERLAP'
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    description: string
  }>
  recentPrescriptions: Array<{
    drug: string
    prescriber: string
    pharmacy: string
    fillDate: string
    quantity: number
    daysSupply: number
  }>
}> {
  // Mock PDMP response - in production, integrate with state PDMP systems
  return {
    checked: true,
    lastChecked: new Date(),
    alerts: [],
    recentPrescriptions: []
  }
}
