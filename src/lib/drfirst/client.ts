import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { getAccessToken, isConfigured as authConfigured } from './auth'

let apiClient: AxiosInstance | null = null

export interface DrFirstConfig {
  apiUrl: string
  practiceId: string
  apiKey: string
  apiSecret: string
  sandbox: boolean
}

/**
 * Get DrFirst configuration from environment
 */
export function getConfig(): DrFirstConfig | null {
  const apiUrl = process.env.DRFIRST_API_URL
  const practiceId = process.env.DRFIRST_PRACTICE_ID
  const apiKey = process.env.DRFIRST_API_KEY
  const apiSecret = process.env.DRFIRST_API_SECRET

  if (!apiUrl || !practiceId || !apiKey || !apiSecret) {
    return null
  }

  return {
    apiUrl,
    practiceId,
    apiKey,
    apiSecret,
    sandbox: process.env.DRFIRST_SANDBOX === 'true',
  }
}

/**
 * Check if DrFirst is configured
 */
export function isConfigured(): boolean {
  return authConfigured()
}

/**
 * Get or create DrFirst API client
 */
export async function getClient(): Promise<AxiosInstance> {
  if (!isConfigured()) {
    throw new Error('DrFirst is not configured')
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

    // Add retry logic
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
  apiClient.defaults.headers.common['X-DrFirst-Practice-Id'] = config.practiceId

  return apiClient
}

/**
 * DrFirst prescription status
 */
export type PrescriptionStatus =
  | 'PENDING'
  | 'SENT'
  | 'ACCEPTED'
  | 'DENIED'
  | 'ERROR'
  | 'CANCELLED'

/**
 * DrFirst transaction type
 */
export type TransactionType =
  | 'NEW_PRESCRIPTION'
  | 'REFILL_REQUEST'
  | 'REFILL_RESPONSE'
  | 'CANCEL_PRESCRIPTION'
  | 'CHANGE_REQUEST'

/**
 * Map DrFirst status to internal status
 */
export function mapDrFirstStatus(status: string): PrescriptionStatus {
  const statusMap: Record<string, PrescriptionStatus> = {
    Pending: 'PENDING',
    Queued: 'PENDING',
    Transmitted: 'SENT',
    Accepted: 'ACCEPTED',
    Verified: 'ACCEPTED',
    Rejected: 'DENIED',
    Error: 'ERROR',
    Cancelled: 'CANCELLED',
  }
  return statusMap[status] || 'PENDING'
}
