import type { EligibilityRequest, ChangeHealthcareConfig } from './types'

/**
 * Build EDI 270 eligibility inquiry request
 * This generates the X12 270 transaction for eligibility verification
 */
export function buildEligibilityRequest(
  request: EligibilityRequest,
  config: ChangeHealthcareConfig
): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
  const controlNumber = `${Date.now()}`.slice(-9)

  const segments: string[] = []

  // ISA - Interchange Control Header
  segments.push(
    `ISA*00*          *00*          *ZZ*${config.submitterId.padEnd(15)}*ZZ*${config.receiverId.padEnd(15)}*${dateStr.slice(2)}*${timeStr}*^*00501*${controlNumber}*0*${config.sandbox ? 'T' : 'P'}*:~`
  )

  // GS - Functional Group Header
  segments.push(
    `GS*HS*${config.submitterId}*${config.receiverId}*${dateStr}*${timeStr}*${controlNumber}*X*005010X279A1~`
  )

  // ST - Transaction Set Header
  segments.push(`ST*270*${controlNumber.slice(0, 4)}*005010X279A1~`)

  // BHT - Beginning of Hierarchical Transaction
  segments.push(`BHT*0022*13*${controlNumber}*${dateStr}*${timeStr}~`)

  // HL - Hierarchical Level (Information Source)
  segments.push(`HL*1**20*1~`)

  // Loop 2100A - Information Source Name
  segments.push(`NM1*PR*2*${request.payerId}****PI*${request.payerId}~`)

  // HL - Hierarchical Level (Information Receiver)
  segments.push(`HL*2*1*21*1~`)

  // Loop 2100B - Information Receiver Name
  segments.push(`NM1*1P*2*HEALTHCARE PRACTICE****XX*${request.providerNpi}~`)

  // REF - Provider Tax ID (optional)
  if (request.providerTaxId) {
    segments.push(`REF*EI*${request.providerTaxId}~`)
  }

  // HL - Hierarchical Level (Subscriber)
  segments.push(`HL*3*2*22*0~`)

  // TRN - Subscriber Trace Number
  segments.push(`TRN*1*${controlNumber}*${config.submitterId}~`)

  // Loop 2100C - Subscriber Name
  segments.push(
    `NM1*IL*1*${request.memberLastName}*${request.memberFirstName}****MI*${request.memberId}~`
  )

  // DMG - Subscriber Demographic Information
  const dobFormatted = request.memberDateOfBirth.replace(/-/g, '')
  segments.push(`DMG*D8*${dobFormatted}~`)

  // DTP - Date of Service
  const serviceDateFormatted = request.serviceDate.replace(/-/g, '')
  segments.push(`DTP*291*D8*${serviceDateFormatted}~`)

  // Loop 2110C - Subscriber Eligibility or Benefit Inquiry
  const serviceTypes = request.serviceTypeCodes || ['30'] // 30 = Health Benefit Plan Coverage
  for (const serviceType of serviceTypes) {
    segments.push(`EQ*${serviceType}~`)
  }

  // SE - Transaction Set Trailer
  segments.push(`SE*${segments.length - 2}*${controlNumber.slice(0, 4)}~`)

  // GE - Functional Group Trailer
  segments.push(`GE*1*${controlNumber}~`)

  // IEA - Interchange Control Trailer
  segments.push(`IEA*1*${controlNumber}~`)

  return segments.join('\n')
}

/**
 * Validate eligibility request before submission
 */
export function validateEligibilityRequest(request: EligibilityRequest): string[] {
  const errors: string[] = []

  if (!request.memberId) {
    errors.push('Member ID is required')
  }

  if (!request.memberDateOfBirth) {
    errors.push('Member date of birth is required')
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(request.memberDateOfBirth)) {
    errors.push('Member date of birth must be in YYYY-MM-DD format')
  }

  if (!request.memberFirstName) {
    errors.push('Member first name is required')
  }

  if (!request.memberLastName) {
    errors.push('Member last name is required')
  }

  if (!request.payerId) {
    errors.push('Payer ID is required')
  }

  if (!request.providerNpi) {
    errors.push('Provider NPI is required')
  } else if (!/^\d{10}$/.test(request.providerNpi)) {
    errors.push('Provider NPI must be 10 digits')
  }

  if (!request.serviceDate) {
    errors.push('Service date is required')
  }

  return errors
}
