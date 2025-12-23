import axios from 'axios'

interface TokenData {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenData | null = null

/**
 * Get DrFirst configuration
 */
function getConfig() {
  const apiUrl = process.env.DRFIRST_API_URL
  const apiKey = process.env.DRFIRST_API_KEY
  const apiSecret = process.env.DRFIRST_API_SECRET

  if (!apiUrl || !apiKey || !apiSecret) {
    return null
  }

  return { apiUrl, apiKey, apiSecret }
}

/**
 * Check if DrFirst is configured
 */
export function isConfigured(): boolean {
  return getConfig() !== null
}

/**
 * Get access token, refreshing if needed
 */
export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken
  }

  const config = getConfig()
  if (!config) {
    throw new Error('DrFirst is not configured')
  }

  try {
    // Request new token
    const response = await axios.post(
      `${config.apiUrl}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: config.apiKey,
        client_secret: config.apiSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const { access_token, expires_in } = response.data

    // Cache the token
    tokenCache = {
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    }

    return access_token
  } catch (error) {
    console.error('Failed to get DrFirst access token:', error)
    throw new Error('Failed to authenticate with DrFirst')
  }
}

/**
 * Clear token cache (useful for testing or when credentials change)
 */
export function clearTokenCache(): void {
  tokenCache = null
}

/**
 * Validate provider EPCS credentials
 */
export async function validateEPCS(
  providerId: string,
  epcsToken: string
): Promise<{
  valid: boolean
  message?: string
  deaSchedules?: string[]
}> {
  if (!isConfigured()) {
    // Return mock for development
    return {
      valid: true,
      deaSchedules: ['II', 'III', 'IV', 'V'],
    }
  }

  try {
    const token = await getAccessToken()
    const config = getConfig()!

    const response = await axios.post(
      `${config.apiUrl}/epcs/validate`,
      {
        providerId,
        epcsToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      valid: response.data.valid,
      deaSchedules: response.data.deaSchedules,
    }
  } catch (error) {
    console.error('Failed to validate EPCS:', error)
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}
