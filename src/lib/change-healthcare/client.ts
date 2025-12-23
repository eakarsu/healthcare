import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { getAccessToken, getConfig, isConfigured } from './auth'
import type {
  EligibilityRequest,
  EligibilityResponse,
  ClaimSubmissionRequest,
  ClaimSubmissionResponse,
} from './types'
import { buildEligibilityRequest } from './edi270'
import { parseEligibilityResponse } from './edi271-parser'
import { buildClaimRequest } from './edi837'

let apiClient: AxiosInstance | null = null

/**
 * Get or create the Change Healthcare API client
 */
async function getClient(): Promise<AxiosInstance> {
  if (!isConfigured()) {
    throw new Error('Change Healthcare is not configured')
  }

  const config = getConfig()!
  const token = await getAccessToken()

  if (!apiClient) {
    apiClient = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add retry logic for transient failures
    axiosRetry(apiClient, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429
        )
      },
    })
  }

  // Update authorization header
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

  return apiClient
}

/**
 * Verify patient eligibility
 */
export async function verifyEligibility(
  request: EligibilityRequest
): Promise<EligibilityResponse> {
  if (!isConfigured()) {
    // Return mock data when not configured
    return getMockEligibilityResponse(request)
  }

  try {
    const client = await getClient()
    const config = getConfig()!

    const edi270 = buildEligibilityRequest(request, config)

    const response = await client.post('/medicalnetwork/eligibility/v3', {
      controlNumber: `${Date.now()}`,
      tradingPartnerServiceId: request.payerId,
      provider: {
        npi: request.providerNpi,
        organizationName: 'Healthcare Practice',
      },
      subscriber: {
        memberId: request.memberId,
        firstName: request.memberFirstName,
        lastName: request.memberLastName,
        dateOfBirth: request.memberDateOfBirth,
      },
      encounter: {
        dateOfService: request.serviceDate,
        serviceTypeCodes: request.serviceTypeCodes || ['30'],
      },
    })

    return parseEligibilityResponse(response.data, edi270)
  } catch (error) {
    console.error('Eligibility verification failed:', error)

    // If API fails, return mock data in sandbox mode
    const config = getConfig()
    if (config?.sandbox) {
      console.log('Returning mock eligibility data (sandbox mode)')
      return getMockEligibilityResponse(request)
    }

    throw new Error('Failed to verify eligibility')
  }
}

/**
 * Submit a claim to the clearinghouse
 */
export async function submitClaim(
  request: ClaimSubmissionRequest
): Promise<ClaimSubmissionResponse> {
  if (!isConfigured()) {
    // Return mock data when not configured
    return getMockClaimSubmissionResponse(request)
  }

  try {
    const client = await getClient()
    const config = getConfig()!

    const edi837 = buildClaimRequest(request, config)

    const response = await client.post('/medicalnetwork/professionalclaims/v3/submission', {
      controlNumber: `${Date.now()}`,
      tradingPartnerServiceId: request.insuranceInfo.payerId,
      submitter: {
        organizationName: request.providerInfo.name,
        contactInformation: {
          name: request.providerInfo.name,
        },
      },
      receiver: {
        organizationName: request.insuranceInfo.payerName,
      },
      subscriber: {
        memberId: request.patientInfo.memberId,
        firstName: request.patientInfo.firstName,
        lastName: request.patientInfo.lastName,
        dateOfBirth: request.patientInfo.dateOfBirth,
        gender: request.patientInfo.gender,
        address: {
          address1: request.patientInfo.address,
          city: request.patientInfo.city,
          state: request.patientInfo.state,
          postalCode: request.patientInfo.zip,
        },
      },
      claimInformation: {
        claimFilingCode: 'CI',
        patientControlNumber: request.claimId,
        claimChargeAmount: request.totalCharges.toFixed(2),
        placeOfServiceCode: request.procedures[0]?.placeOfService || '11',
        claimFrequencyCode: '1',
        signatureIndicator: 'Y',
        releaseInformationCode: 'Y',
        benefitsAssignmentCertificationIndicator: 'Y',
        healthCareCodeInformation: request.diagnoses.map((d) => ({
          diagnosisTypeCode: 'ABK',
          diagnosisCode: d.code,
        })),
        serviceFacilityLocation: {
          organizationName: request.providerInfo.name,
          address: {
            address1: request.providerInfo.address,
            city: request.providerInfo.city,
            state: request.providerInfo.state,
            postalCode: request.providerInfo.zip,
          },
        },
        serviceLines: request.procedures.map((proc, index) => ({
          serviceLineNumber: (index + 1).toString(),
          professionalService: {
            procedureCode: proc.cptCode,
            procedureModifiers: proc.modifiers,
            lineItemChargeAmount: proc.chargeAmount.toFixed(2),
            measurementUnit: 'UN',
            serviceUnitCount: proc.quantity.toString(),
            diagnosisCodePointers: proc.diagnosisPointers.map((p) => p.toString()),
          },
          serviceDate: proc.serviceDate,
        })),
      },
      providers: [
        {
          providerType: 'BillingProvider',
          npi: request.providerInfo.npi,
          employerId: request.providerInfo.taxId,
          organizationName: request.providerInfo.name,
          address: {
            address1: request.providerInfo.address,
            city: request.providerInfo.city,
            state: request.providerInfo.state,
            postalCode: request.providerInfo.zip,
          },
        },
      ],
    })

    return {
      transactionId: response.data.controlNumber || `TXN-${Date.now()}`,
      status: 'SUBMITTED',
      claimNumber: response.data.claimNumber,
      raw837: edi837,
    }
  } catch (error) {
    console.error('Claim submission failed:', error)

    // If API fails, return mock data in sandbox mode
    const config = getConfig()
    if (config?.sandbox) {
      console.log('Returning mock claim submission data (sandbox mode)')
      return getMockClaimSubmissionResponse(request)
    }

    throw new Error('Failed to submit claim')
  }
}

/**
 * Check claim status
 */
export async function checkClaimStatus(
  transactionId: string
): Promise<{ status: string; message?: string }> {
  if (!isConfigured()) {
    return {
      status: 'ACKNOWLEDGED',
      message: 'Mock status check (not configured)',
    }
  }

  try {
    const client = await getClient()

    const response = await client.get(
      `/medicalnetwork/professionalclaims/v3/submission/${transactionId}/status`
    )

    return {
      status: response.data.status,
      message: response.data.message,
    }
  } catch (error) {
    console.error('Claim status check failed:', error)
    throw new Error('Failed to check claim status')
  }
}

/**
 * Mock eligibility response for development/testing
 */
function getMockEligibilityResponse(request: EligibilityRequest): EligibilityResponse {
  const today = new Date()
  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  return {
    transactionId: `MOCK-${Date.now()}`,
    status: 'ACTIVE',
    planName: 'Sample Health Plan PPO',
    groupNumber: 'GRP12345',
    memberId: request.memberId,
    effectiveDate: yearAgo.toISOString().split('T')[0],
    copay: [
      { type: 'Office Visit', amount: 25 },
      { type: 'Specialist', amount: 45 },
      { type: 'Urgent Care', amount: 75 },
      { type: 'Emergency Room', amount: 250 },
    ],
    deductible: [
      { type: 'Individual', total: 1500, met: 750, remaining: 750 },
      { type: 'Family', total: 3000, met: 1200, remaining: 1800 },
    ],
    outOfPocket: [
      { type: 'Individual', total: 6000, remaining: 5250 },
      { type: 'Family', total: 12000, remaining: 10800 },
    ],
    coinsurance: 20,
    networkStatus: 'IN_NETWORK',
  }
}

/**
 * Mock claim submission response for development/testing
 */
function getMockClaimSubmissionResponse(
  request: ClaimSubmissionRequest
): ClaimSubmissionResponse {
  return {
    transactionId: `MOCK-TXN-${Date.now()}`,
    status: 'SUBMITTED',
    claimNumber: `CLM-${Date.now()}`,
  }
}
