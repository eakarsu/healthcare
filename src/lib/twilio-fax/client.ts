import Twilio from 'twilio'

let twilioClient: ReturnType<typeof Twilio> | null = null

export interface TwilioFaxConfig {
  accountSid: string
  authToken: string
  faxNumber: string
  webhookUrl: string
}

/**
 * Get Twilio configuration from environment
 */
export function getConfig(): TwilioFaxConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const faxNumber = process.env.TWILIO_FAX_NUMBER

  if (!accountSid || !authToken || !faxNumber) {
    return null
  }

  return {
    accountSid,
    authToken,
    faxNumber,
    webhookUrl: process.env.TWILIO_FAX_WEBHOOK_URL || '',
  }
}

/**
 * Check if Twilio Fax is configured
 */
export function isConfigured(): boolean {
  return getConfig() !== null
}

/**
 * Get or create Twilio client
 */
export function getClient(): ReturnType<typeof Twilio> | null {
  const config = getConfig()
  if (!config) {
    return null
  }

  if (!twilioClient) {
    twilioClient = Twilio(config.accountSid, config.authToken)
  }

  return twilioClient
}

/**
 * Validate phone number format for fax
 */
export function validateFaxNumber(number: string): string | null {
  // Remove all non-digit characters except +
  const cleaned = number.replace(/[^\d+]/g, '')

  // Check if it's a valid E.164 format
  if (/^\+1\d{10}$/.test(cleaned)) {
    return cleaned
  }

  // If 10 digits, assume US number
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`
  }

  // If 11 digits starting with 1, add +
  if (/^1\d{10}$/.test(cleaned)) {
    return `+${cleaned}`
  }

  return null
}

/**
 * Get fax status description
 */
export function getFaxStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    queued: 'Fax is queued for sending',
    processing: 'Fax is being processed',
    sending: 'Fax is being transmitted',
    delivered: 'Fax was successfully delivered',
    receiving: 'Fax is being received',
    received: 'Fax has been received',
    'no-answer': 'The fax number did not answer',
    busy: 'The fax number was busy',
    failed: 'Fax transmission failed',
    canceled: 'Fax was canceled',
  }
  return descriptions[status] || status
}
