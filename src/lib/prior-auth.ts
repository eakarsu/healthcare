// Prior Authorization Automation System
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

// Prior authorization request data
export interface PriorAuthRequest {
  patientId: string
  insuranceId: string
  procedureCodes: string[]
  diagnosisCodes: string[]
  serviceType: string
  serviceDate?: Date
  urgency: 'STANDARD' | 'URGENT'
  clinicalNotes?: string
  supportingDocuments?: string[]
}

// Payer rules for authorization requirements
export interface PayerAuthRule {
  procedureCode: string
  payerName: string
  requiresAuth: boolean
  criteria?: string[]
  typicalDuration?: number // days
  submissionMethod?: 'PORTAL' | 'FAX' | 'PHONE' | 'API'
  portalUrl?: string
  faxNumber?: string
}

// Check if procedure requires prior authorization for a given payer
export async function checkAuthRequirement(
  procedureCode: string,
  payerName: string,
  diagnosisCodes: string[]
): Promise<{
  requiresAuth: boolean
  criteria?: string[]
  typicalDuration?: number
  submissionMethod?: string
  reason?: string
}> {
  // Common procedures that typically require prior auth
  const highCostProcedures = [
    '27447', // Knee replacement
    '27130', // Hip replacement
    '72148', // MRI lumbar spine
    '72141', // MRI cervical spine
    '70553', // MRI brain with contrast
    '43239', // Upper GI endoscopy with biopsy
    '45380', // Colonoscopy with biopsy
    '29881', // Knee arthroscopy
    '64483', // Epidural injection
    '62323', // Lumbar epidural
  ]

  const imagingProcedures = ['72148', '72141', '70553', '70552', '70551', '72149', '72156']
  const surgicalProcedures = ['27447', '27130', '29881', '43239', '45380']
  const dmeProcedures = ['E0601', 'E0424', 'E0260', 'E1390']

  const requiresAuth = highCostProcedures.includes(procedureCode) ||
    imagingProcedures.includes(procedureCode) ||
    surgicalProcedures.includes(procedureCode) ||
    dmeProcedures.includes(procedureCode)

  let criteria: string[] = []
  let typicalDuration = 5
  let submissionMethod = 'PORTAL'
  let reason = ''

  if (imagingProcedures.includes(procedureCode)) {
    criteria = [
      'Failed conservative treatment for 4-6 weeks',
      'Documentation of physical therapy attempts',
      'Plain films obtained first (if applicable)',
      'Clinical notes supporting medical necessity'
    ]
    typicalDuration = 3
    reason = 'Advanced imaging requires documentation of failed conservative management'
  } else if (surgicalProcedures.includes(procedureCode)) {
    criteria = [
      'Conservative treatment failed for 6+ months',
      'Physical therapy documentation',
      'Recent imaging supporting diagnosis',
      'Specialist evaluation notes',
      'BMI requirements (if applicable)'
    ]
    typicalDuration = 10
    reason = 'Surgical procedures require extensive clinical documentation'
  } else if (dmeProcedures.includes(procedureCode)) {
    criteria = [
      'Medical necessity documentation',
      'Face-to-face evaluation notes',
      'Prescription from treating physician',
      'Home assessment (if required)'
    ]
    typicalDuration = 5
    reason = 'DME requires documentation of medical necessity and home evaluation'
  }

  return {
    requiresAuth,
    criteria: requiresAuth ? criteria : undefined,
    typicalDuration: requiresAuth ? typicalDuration : undefined,
    submissionMethod: requiresAuth ? submissionMethod : undefined,
    reason: requiresAuth ? reason : 'Procedure does not typically require prior authorization'
  }
}

// Generate clinical justification letter for prior auth
export async function generateClinicalJustification(request: {
  patientInfo: {
    name: string
    dateOfBirth: string
    memberId: string
  }
  procedureCode: string
  procedureDescription: string
  diagnosisCodes: Array<{ code: string; description: string }>
  clinicalHistory: string
  treatmentHistory?: string
  providerInfo: {
    name: string
    npi: string
    specialty: string
  }
}): Promise<{
  letter: string
  keyPoints: string[]
  medicalNecessityScore: number
}> {
  if (!openai) {
    // Generate mock letter
    const letter = `
PRIOR AUTHORIZATION REQUEST - CLINICAL JUSTIFICATION

Date: ${new Date().toLocaleDateString()}

Patient: ${request.patientInfo.name}
DOB: ${request.patientInfo.dateOfBirth}
Member ID: ${request.patientInfo.memberId}

Requesting Provider: ${request.providerInfo.name}, ${request.providerInfo.specialty}
NPI: ${request.providerInfo.npi}

Requested Service: ${request.procedureDescription} (CPT: ${request.procedureCode})

Diagnosis:
${request.diagnosisCodes.map(d => `- ${d.code}: ${d.description}`).join('\n')}

Clinical Summary:
${request.clinicalHistory}

${request.treatmentHistory ? `Treatment History:\n${request.treatmentHistory}\n` : ''}

Medical Necessity Justification:
Based on the patient's clinical presentation and treatment history, the requested procedure is medically necessary. Conservative treatment options have been exhausted, and the proposed intervention represents the most appropriate next step in the patient's care plan.

The patient meets the coverage criteria for this service based on:
1. Confirmed diagnosis supported by clinical findings
2. Failure of conservative management
3. Documentation of functional impairment
4. Appropriate specialist evaluation

We respectfully request authorization for this medically necessary service.

Sincerely,
${request.providerInfo.name}
${request.providerInfo.specialty}
NPI: ${request.providerInfo.npi}
`

    return {
      letter,
      keyPoints: [
        'Conservative treatment attempted and failed',
        'Clinical findings support diagnosis',
        'Functional impairment documented',
        'Service aligns with clinical guidelines'
      ],
      medicalNecessityScore: 0.82
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical documentation specialist creating prior authorization clinical justification letters.
Write a professional, compelling letter that clearly demonstrates medical necessity.
Focus on:
- Clinical findings supporting the diagnosis
- Failed conservative treatments
- Functional impairment
- Alignment with coverage guidelines

Return ONLY a JSON object:
{
  "letter": "Full letter text",
  "keyPoints": ["Point 1", "Point 2"],
  "medicalNecessityScore": 0.0-1.0
}`
        },
        {
          role: 'user',
          content: `Generate prior auth justification letter:
Patient: ${request.patientInfo.name} (DOB: ${request.patientInfo.dateOfBirth}, Member ID: ${request.patientInfo.memberId})
Procedure: ${request.procedureDescription} (${request.procedureCode})
Diagnoses: ${request.diagnosisCodes.map(d => `${d.code}: ${d.description}`).join(', ')}
Clinical History: ${request.clinicalHistory}
Treatment History: ${request.treatmentHistory || 'Not specified'}
Provider: ${request.providerInfo.name}, ${request.providerInfo.specialty} (NPI: ${request.providerInfo.npi})`
        }
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid format')

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Letter generation error:', error)
    throw error
  }
}

// Track authorization status
export interface AuthStatusUpdate {
  authId: string
  status: 'PENDING' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'DENIED' | 'APPEALED' | 'EXPIRED'
  authNumber?: string
  approvedUnits?: number
  expirationDate?: Date
  denialReason?: string
  appealDeadline?: Date
  notes?: string
}

// Generate appeal letter for denied authorization
export async function generateAppealLetter(request: {
  originalAuth: {
    procedureCode: string
    procedureDescription: string
    diagnosisCodes: Array<{ code: string; description: string }>
    denialReason: string
    denialDate: string
  }
  patientInfo: {
    name: string
    dateOfBirth: string
    memberId: string
  }
  additionalClinicalInfo: string
  providerInfo: {
    name: string
    npi: string
    specialty: string
  }
}): Promise<{
  letter: string
  appealPoints: string[]
  successLikelihood: number
}> {
  if (!openai) {
    const letter = `
APPEAL REQUEST - PRIOR AUTHORIZATION DENIAL

Date: ${new Date().toLocaleDateString()}

RE: Appeal of Prior Authorization Denial
Patient: ${request.patientInfo.name}
DOB: ${request.patientInfo.dateOfBirth}
Member ID: ${request.patientInfo.memberId}
Original Denial Date: ${request.originalAuth.denialDate}

Dear Medical Director,

I am writing to formally appeal the denial of prior authorization for ${request.originalAuth.procedureDescription} (CPT: ${request.originalAuth.procedureCode}) for the above-referenced patient.

DENIAL REASON STATED: ${request.originalAuth.denialReason}

RESPONSE TO DENIAL:
We respectfully disagree with this determination. The following additional clinical information supports the medical necessity of this service:

${request.additionalClinicalInfo}

SUPPORTING EVIDENCE:
1. The patient's condition meets clinical guidelines for this intervention
2. Conservative treatments have been documented and have failed
3. Functional impairment significantly impacts quality of life
4. The requested service is the most appropriate treatment option

We request expedited review of this appeal and authorization of the requested service.

Respectfully,
${request.providerInfo.name}
${request.providerInfo.specialty}
NPI: ${request.providerInfo.npi}
`

    return {
      letter,
      appealPoints: [
        'Address specific denial reason with clinical evidence',
        'Reference applicable clinical guidelines',
        'Document failed alternatives',
        'Emphasize functional impairment'
      ],
      successLikelihood: 0.65
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical appeals specialist. Write a compelling appeal letter that directly addresses the denial reason with clinical evidence.

Return ONLY a JSON object:
{
  "letter": "Full appeal letter text",
  "appealPoints": ["Key argument 1", "Key argument 2"],
  "successLikelihood": 0.0-1.0
}`
        },
        {
          role: 'user',
          content: `Generate appeal letter:
Patient: ${request.patientInfo.name}
Denied Procedure: ${request.originalAuth.procedureDescription} (${request.originalAuth.procedureCode})
Denial Reason: ${request.originalAuth.denialReason}
Additional Clinical Info: ${request.additionalClinicalInfo}
Provider: ${request.providerInfo.name}`
        }
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid format')

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Appeal letter generation error:', error)
    throw error
  }
}

// Prepare fax submission (in production, integrate with fax API like SRFax, eFax)
export async function prepareFaxSubmission(request: {
  recipientFax: string
  coverPageInfo: {
    toName: string
    toCompany: string
    fromName: string
    fromCompany: string
    fromPhone: string
    fromFax: string
    pages: number
    urgent: boolean
    subject: string
  }
  documents: string[] // File paths
}): Promise<{
  faxId: string
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED'
  estimatedDelivery: Date
}> {
  // In production, this would integrate with a fax service API
  return {
    faxId: `FAX-${Date.now()}`,
    status: 'QUEUED',
    estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  }
}

// Common payer portal URLs (mock data - in production, maintain database)
export const PAYER_PORTALS: Record<string, { name: string; portalUrl: string; fax?: string }> = {
  'BCBS': {
    name: 'Blue Cross Blue Shield',
    portalUrl: 'https://provider.bcbs.com/prior-auth',
    fax: '1-800-555-0100'
  },
  'AETNA': {
    name: 'Aetna',
    portalUrl: 'https://provider.aetna.com/authportal',
    fax: '1-800-555-0101'
  },
  'CIGNA': {
    name: 'Cigna',
    portalUrl: 'https://cignaforhcp.cigna.com/priorauth',
    fax: '1-800-555-0102'
  },
  'UNITED': {
    name: 'UnitedHealthcare',
    portalUrl: 'https://provider.uhc.com/eauth',
    fax: '1-800-555-0103'
  },
  'HUMANA': {
    name: 'Humana',
    portalUrl: 'https://provider.humana.com/authrequest',
    fax: '1-800-555-0104'
  },
  'MEDICARE': {
    name: 'Medicare',
    portalUrl: 'https://portal.cms.gov/priorauth',
    fax: '1-800-555-0105'
  }
}
