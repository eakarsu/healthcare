export interface ChangeHealthcareConfig {
  clientId: string
  clientSecret: string
  apiUrl: string
  submitterId: string
  receiverId: string
  sandbox: boolean
}

export interface EligibilityRequest {
  memberId: string
  memberDateOfBirth: string
  memberFirstName: string
  memberLastName: string
  payerId: string
  providerNpi: string
  providerTaxId?: string
  serviceDate: string
  serviceTypeCodes?: string[]
}

export interface EligibilityResponse {
  transactionId: string
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN'
  planName: string
  groupNumber: string
  memberId: string
  effectiveDate: string
  terminationDate?: string
  copay: CopayInfo[]
  deductible: DeductibleInfo[]
  outOfPocket: OutOfPocketInfo[]
  coinsurance?: number
  networkStatus: string
  raw271?: string
}

export interface CopayInfo {
  type: string
  amount: number
  description?: string
}

export interface DeductibleInfo {
  type: string
  total: number
  remaining: number
  met: number
}

export interface OutOfPocketInfo {
  type: string
  total: number
  remaining: number
}

export interface ClaimSubmissionRequest {
  claimId: string
  patientInfo: PatientInfo
  providerInfo: ProviderInfo
  insuranceInfo: InsuranceInfo
  diagnoses: DiagnosisInfo[]
  procedures: ProcedureInfo[]
  serviceDate: string
  totalCharges: number
}

export interface PatientInfo {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'U'
  memberId: string
  address: string
  city: string
  state: string
  zip: string
}

export interface ProviderInfo {
  npi: string
  taxId: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  taxonomy?: string
}

export interface InsuranceInfo {
  payerId: string
  payerName: string
  groupNumber?: string
  subscriberId: string
  relationshipCode: string
}

export interface DiagnosisInfo {
  code: string
  sequence: number
}

export interface ProcedureInfo {
  cptCode: string
  modifiers: string[]
  quantity: number
  chargeAmount: number
  serviceDate: string
  diagnosisPointers: number[]
  placeOfService: string
}

export interface ClaimSubmissionResponse {
  transactionId: string
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'REJECTED' | 'ERROR'
  claimNumber?: string
  errorMessage?: string
  raw837?: string
}

export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}
