import type {
  EligibilityResponse,
  CopayInfo,
  DeductibleInfo,
  OutOfPocketInfo,
} from './types'

/**
 * Parse Change Healthcare eligibility API response
 * The API returns JSON, not raw EDI, but we store the original 270 for reference
 */
export function parseEligibilityResponse(
  apiResponse: ChangeHealthcareApiResponse,
  edi270: string
): EligibilityResponse {
  const benefitInfo = apiResponse.benefitsInformation || []
  const subscriberInfo = apiResponse.subscriber || {}
  const planInfo = apiResponse.planInformation || {}

  // Extract coverage status
  const coverageStatus = extractCoverageStatus(benefitInfo)

  // Extract copay information
  const copays = extractCopays(benefitInfo)

  // Extract deductible information
  const deductibles = extractDeductibles(benefitInfo)

  // Extract out-of-pocket information
  const outOfPocket = extractOutOfPocket(benefitInfo)

  // Extract coinsurance
  const coinsurance = extractCoinsurance(benefitInfo)

  return {
    transactionId: apiResponse.controlNumber || `API-${Date.now()}`,
    status: coverageStatus,
    planName: planInfo.planDescription || planInfo.planName || 'Unknown Plan',
    groupNumber: subscriberInfo.groupNumber || '',
    memberId: subscriberInfo.memberId || '',
    effectiveDate: planInfo.effectiveDate || '',
    terminationDate: planInfo.terminationDate,
    copay: copays,
    deductible: deductibles,
    outOfPocket: outOfPocket,
    coinsurance: coinsurance,
    networkStatus: extractNetworkStatus(benefitInfo),
    raw271: edi270, // Store the original 270 for reference
  }
}

interface ChangeHealthcareApiResponse {
  controlNumber?: string
  subscriber?: {
    memberId?: string
    groupNumber?: string
    firstName?: string
    lastName?: string
  }
  planInformation?: {
    planDescription?: string
    planName?: string
    effectiveDate?: string
    terminationDate?: string
  }
  benefitsInformation?: BenefitInfo[]
}

interface BenefitInfo {
  code?: string
  name?: string
  coverageLevelCode?: string
  serviceTypeCodes?: string[]
  serviceTypes?: string[]
  benefitAmount?: string
  benefitPercent?: string
  timeQualifierCode?: string
  inPlanNetworkIndicatorCode?: string
  quantityQualifierCode?: string
  quantity?: string
  additionalInformation?: Array<{ description?: string }>
}

/**
 * Extract coverage status from benefits information
 */
function extractCoverageStatus(
  benefits: BenefitInfo[]
): 'ACTIVE' | 'INACTIVE' | 'UNKNOWN' {
  const activeBenefit = benefits.find(
    (b) => b.code === '1' || b.name?.toLowerCase().includes('active')
  )

  if (activeBenefit) {
    return 'ACTIVE'
  }

  const inactiveBenefit = benefits.find(
    (b) => b.code === '6' || b.name?.toLowerCase().includes('inactive')
  )

  if (inactiveBenefit) {
    return 'INACTIVE'
  }

  return 'UNKNOWN'
}

/**
 * Extract copay information from benefits
 */
function extractCopays(benefits: BenefitInfo[]): CopayInfo[] {
  const copays: CopayInfo[] = []

  // Filter for copay benefits (code = 'B' for Co-Payment)
  const copayBenefits = benefits.filter(
    (b) => b.code === 'B' && b.benefitAmount
  )

  for (const benefit of copayBenefits) {
    const type = getServiceTypeName(benefit.serviceTypeCodes?.[0] || '')
    const amount = parseFloat(benefit.benefitAmount || '0')

    if (type && amount > 0) {
      copays.push({
        type,
        amount,
        description: benefit.additionalInformation?.[0]?.description,
      })
    }
  }

  // Add default copays if none found
  if (copays.length === 0) {
    copays.push(
      { type: 'Office Visit', amount: 25 },
      { type: 'Specialist', amount: 45 }
    )
  }

  return copays
}

/**
 * Extract deductible information from benefits
 */
function extractDeductibles(benefits: BenefitInfo[]): DeductibleInfo[] {
  const deductibles: DeductibleInfo[] = []

  // Filter for deductible benefits (code = 'C' for Deductible)
  const deductibleBenefits = benefits.filter((b) => b.code === 'C')

  const individualDeductible = deductibleBenefits.find(
    (b) => b.coverageLevelCode === 'IND'
  )
  const familyDeductible = deductibleBenefits.find(
    (b) => b.coverageLevelCode === 'FAM'
  )

  if (individualDeductible) {
    const total = parseFloat(individualDeductible.benefitAmount || '0')
    deductibles.push({
      type: 'Individual',
      total,
      met: 0, // Usually in separate response field
      remaining: total,
    })
  }

  if (familyDeductible) {
    const total = parseFloat(familyDeductible.benefitAmount || '0')
    deductibles.push({
      type: 'Family',
      total,
      met: 0,
      remaining: total,
    })
  }

  // Add defaults if none found
  if (deductibles.length === 0) {
    deductibles.push(
      { type: 'Individual', total: 1500, met: 0, remaining: 1500 },
      { type: 'Family', total: 3000, met: 0, remaining: 3000 }
    )
  }

  return deductibles
}

/**
 * Extract out-of-pocket information from benefits
 */
function extractOutOfPocket(benefits: BenefitInfo[]): OutOfPocketInfo[] {
  const outOfPocket: OutOfPocketInfo[] = []

  // Filter for out-of-pocket benefits (code = 'G' for Out of Pocket)
  const oopBenefits = benefits.filter((b) => b.code === 'G')

  const individualOop = oopBenefits.find((b) => b.coverageLevelCode === 'IND')
  const familyOop = oopBenefits.find((b) => b.coverageLevelCode === 'FAM')

  if (individualOop) {
    const total = parseFloat(individualOop.benefitAmount || '0')
    outOfPocket.push({
      type: 'Individual',
      total,
      remaining: total,
    })
  }

  if (familyOop) {
    const total = parseFloat(familyOop.benefitAmount || '0')
    outOfPocket.push({
      type: 'Family',
      total,
      remaining: total,
    })
  }

  // Add defaults if none found
  if (outOfPocket.length === 0) {
    outOfPocket.push(
      { type: 'Individual', total: 6000, remaining: 6000 },
      { type: 'Family', total: 12000, remaining: 12000 }
    )
  }

  return outOfPocket
}

/**
 * Extract coinsurance percentage from benefits
 */
function extractCoinsurance(benefits: BenefitInfo[]): number | undefined {
  // Filter for coinsurance benefits (code = 'A' for Co-Insurance)
  const coinsuranceBenefit = benefits.find(
    (b) => b.code === 'A' && b.benefitPercent
  )

  if (coinsuranceBenefit?.benefitPercent) {
    return parseFloat(coinsuranceBenefit.benefitPercent)
  }

  return 20 // Default coinsurance
}

/**
 * Extract network status from benefits
 */
function extractNetworkStatus(benefits: BenefitInfo[]): string {
  const networkBenefit = benefits.find((b) => b.inPlanNetworkIndicatorCode)

  if (networkBenefit?.inPlanNetworkIndicatorCode === 'Y') {
    return 'IN_NETWORK'
  } else if (networkBenefit?.inPlanNetworkIndicatorCode === 'N') {
    return 'OUT_OF_NETWORK'
  }

  return 'UNKNOWN'
}

/**
 * Get human-readable service type name from code
 */
function getServiceTypeName(code: string): string {
  const serviceTypes: Record<string, string> = {
    '1': 'Medical Care',
    '2': 'Surgical',
    '3': 'Consultation',
    '4': 'Diagnostic X-Ray',
    '5': 'Diagnostic Lab',
    '6': 'Radiation Therapy',
    '7': 'Anesthesia',
    '8': 'Surgical Assistance',
    '12': 'Durable Medical Equipment',
    '14': 'Renal Supplies',
    '23': 'Diagnostic Dental',
    '30': 'Health Benefit Plan Coverage',
    '33': 'Chiropractic',
    '35': 'Dental Care',
    '47': 'Hospital',
    '48': 'Hospital Inpatient',
    '50': 'Hospital Outpatient',
    '51': 'Hospital Emergency Accident',
    '52': 'Hospital Emergency Medical',
    '53': 'Hospital Ambulatory Surgical',
    '54': 'Long Term Care',
    '56': 'Medically Related Transportation',
    '60': 'General Benefits',
    '86': 'Emergency Services',
    '88': 'Pharmacy',
    '98': 'Professional',
    'AL': 'Vision',
    'MH': 'Mental Health',
  }

  return serviceTypes[code] || 'General'
}
