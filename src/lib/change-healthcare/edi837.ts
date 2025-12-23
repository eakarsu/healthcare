import type { ClaimSubmissionRequest, ChangeHealthcareConfig } from './types'

/**
 * Build EDI 837P (Professional) claim request
 * This generates the X12 837 transaction for claims submission
 */
export function buildClaimRequest(
  request: ClaimSubmissionRequest,
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
    `GS*HC*${config.submitterId}*${config.receiverId}*${dateStr}*${timeStr}*${controlNumber}*X*005010X222A1~`
  )

  // ST - Transaction Set Header
  segments.push(`ST*837*${controlNumber.slice(0, 4)}*005010X222A1~`)

  // BHT - Beginning of Hierarchical Transaction
  segments.push(`BHT*0019*00*${controlNumber}*${dateStr}*${timeStr}*CH~`)

  // Loop 1000A - Submitter Name
  segments.push(`NM1*41*2*${request.providerInfo.name}*****46*${request.providerInfo.taxId}~`)
  segments.push(`PER*IC*BILLING*TE*5555555555~`)

  // Loop 1000B - Receiver Name
  segments.push(`NM1*40*2*${request.insuranceInfo.payerName}*****46*${request.insuranceInfo.payerId}~`)

  // HL - Hierarchical Level (Billing Provider)
  segments.push(`HL*1**20*1~`)

  // Loop 2000A - Billing Provider
  segments.push(`NM1*85*2*${request.providerInfo.name}*****XX*${request.providerInfo.npi}~`)
  segments.push(
    `N3*${request.providerInfo.address}~`
  )
  segments.push(
    `N4*${request.providerInfo.city}*${request.providerInfo.state}*${request.providerInfo.zip}~`
  )
  segments.push(`REF*EI*${request.providerInfo.taxId}~`)

  // HL - Hierarchical Level (Subscriber)
  segments.push(`HL*2*1*22*0~`)

  // SBR - Subscriber Information
  segments.push(
    `SBR*P*${request.insuranceInfo.relationshipCode}*${request.insuranceInfo.groupNumber || ''}****CI~`
  )

  // Loop 2010BA - Subscriber Name
  const pat = request.patientInfo
  segments.push(
    `NM1*IL*1*${pat.lastName}*${pat.firstName}*${pat.middleName || ''}***MI*${pat.memberId}~`
  )
  segments.push(`N3*${pat.address}~`)
  segments.push(`N4*${pat.city}*${pat.state}*${pat.zip}~`)
  segments.push(`DMG*D8*${pat.dateOfBirth.replace(/-/g, '')}*${pat.gender}~`)

  // Loop 2010BB - Payer Name
  segments.push(
    `NM1*PR*2*${request.insuranceInfo.payerName}*****PI*${request.insuranceInfo.payerId}~`
  )

  // Loop 2300 - Claim Information
  const claimId = request.claimId.slice(0, 20)
  const totalCharges = request.totalCharges.toFixed(2)
  const placeOfService = request.procedures[0]?.placeOfService || '11'

  segments.push(`CLM*${claimId}*${totalCharges}***${placeOfService}:B:1*Y*A*Y*Y~`)

  // REF - Claim Reference Numbers
  segments.push(`REF*D9*${controlNumber}~`)

  // HI - Health Care Diagnosis Codes
  const diagnosisCodes = request.diagnoses
    .map((d, i) => `${i === 0 ? 'ABK' : 'ABF'}:${d.code.replace('.', '')}`)
    .join('*')
  segments.push(`HI*${diagnosisCodes}~`)

  // Loop 2310A - Referring Provider (if applicable)
  // Skipped for now

  // Loop 2310B - Rendering Provider
  segments.push(`NM1*82*1*${request.providerInfo.name}*****XX*${request.providerInfo.npi}~`)

  // Loop 2310C - Service Facility Location
  segments.push(`NM1*77*2*${request.providerInfo.name}*****XX*${request.providerInfo.npi}~`)
  segments.push(`N3*${request.providerInfo.address}~`)
  segments.push(`N4*${request.providerInfo.city}*${request.providerInfo.state}*${request.providerInfo.zip}~`)

  // Loop 2400 - Service Lines
  let lineNumber = 0
  for (const proc of request.procedures) {
    lineNumber++

    // LX - Service Line Number
    segments.push(`LX*${lineNumber}~`)

    // SV1 - Professional Service
    const modifiers = proc.modifiers.length > 0 ? `:${proc.modifiers.join(':')}` : ''
    const diagPointers = proc.diagnosisPointers.join(':')
    segments.push(
      `SV1*HC:${proc.cptCode}${modifiers}*${proc.chargeAmount.toFixed(2)}*UN*${proc.quantity}***${diagPointers}~`
    )

    // DTP - Service Date
    const serviceDate = proc.serviceDate.replace(/-/g, '')
    segments.push(`DTP*472*D8*${serviceDate}~`)
  }

  // SE - Transaction Set Trailer
  const segmentCount = segments.length - 2 // Exclude ISA and GS
  segments.push(`SE*${segmentCount}*${controlNumber.slice(0, 4)}~`)

  // GE - Functional Group Trailer
  segments.push(`GE*1*${controlNumber}~`)

  // IEA - Interchange Control Trailer
  segments.push(`IEA*1*${controlNumber}~`)

  return segments.join('\n')
}

/**
 * Validate claim submission request before processing
 */
export function validateClaimRequest(request: ClaimSubmissionRequest): string[] {
  const errors: string[] = []

  // Validate patient info
  if (!request.patientInfo.firstName) errors.push('Patient first name is required')
  if (!request.patientInfo.lastName) errors.push('Patient last name is required')
  if (!request.patientInfo.dateOfBirth) errors.push('Patient date of birth is required')
  if (!request.patientInfo.memberId) errors.push('Patient member ID is required')
  if (!request.patientInfo.address) errors.push('Patient address is required')

  // Validate provider info
  if (!request.providerInfo.npi) errors.push('Provider NPI is required')
  if (!request.providerInfo.taxId) errors.push('Provider Tax ID is required')
  if (!request.providerInfo.name) errors.push('Provider name is required')

  // Validate insurance info
  if (!request.insuranceInfo.payerId) errors.push('Payer ID is required')
  if (!request.insuranceInfo.subscriberId) errors.push('Subscriber ID is required')

  // Validate diagnoses
  if (!request.diagnoses || request.diagnoses.length === 0) {
    errors.push('At least one diagnosis is required')
  }

  // Validate procedures
  if (!request.procedures || request.procedures.length === 0) {
    errors.push('At least one procedure is required')
  }

  for (let i = 0; i < (request.procedures?.length || 0); i++) {
    const proc = request.procedures[i]
    if (!proc.cptCode) errors.push(`Procedure ${i + 1}: CPT code is required`)
    if (!proc.chargeAmount || proc.chargeAmount <= 0) {
      errors.push(`Procedure ${i + 1}: Valid charge amount is required`)
    }
    if (!proc.diagnosisPointers || proc.diagnosisPointers.length === 0) {
      errors.push(`Procedure ${i + 1}: Diagnosis pointer is required`)
    }
  }

  return errors
}
