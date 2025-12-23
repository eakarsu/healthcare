import axios from 'axios'
import type { TokenResponse, ChangeHealthcareConfig } from './types'

let cachedToken: {
  accessToken: string
  expiresAt: number
} | null = null

/**
 * Get Change Healthcare configuration from environment
 */
export function getConfig(): ChangeHealthcareConfig | null {
  const clientId = process.env.CHANGE_HEALTHCARE_CLIENT_ID
  const clientSecret = process.env.CHANGE_HEALTHCARE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  return {
    clientId,
    clientSecret,
    apiUrl: process.env.CHANGE_HEALTHCARE_API_URL || 'https://apigw.changehealthcare.com',
    submitterId: process.env.CHANGE_HEALTHCARE_SUBMITTER_ID || '',
    receiverId: process.env.CHANGE_HEALTHCARE_RECEIVER_ID || 'CHNG',
    sandbox: process.env.CHANGE_HEALTHCARE_SANDBOX === 'true',
  }
}

/**
 * Get OAuth access token from Change Healthcare
 */
export async function getAccessToken(): Promise<string> {
  const config = getConfig()
  if (!config) {
    throw new Error('Change Healthcare not configured')
  }

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.accessToken
  }

  try {
    const tokenUrl = `${config.apiUrl}/apip/auth/v2/token`

    const response = await axios.post<TokenResponse>(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    cachedToken = {
      accessToken: response.data.access_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    }

    return cachedToken.accessToken
  } catch (error) {
    console.error('Failed to get Change Healthcare access token:', error)
    throw new Error('Failed to authenticate with Change Healthcare')
  }
}

/**
 * Clear the cached token (useful for testing or when token is invalid)
 */
export function clearTokenCache(): void {
  cachedToken = null
}

/**
 * Check if Change Healthcare is configured
 */
export function isConfigured(): boolean {
  return getConfig() !== null
}
