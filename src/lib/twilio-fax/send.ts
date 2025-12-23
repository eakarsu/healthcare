import { getClient, getConfig, validateFaxNumber, isConfigured } from './client'
import { prisma } from '@/lib/prisma'

export interface SendFaxOptions {
  to: string
  mediaUrl?: string
  documentPath?: string
  patientId?: string
  category?: string
}

export interface SendFaxResult {
  success: boolean
  faxId?: string
  twilioSid?: string
  status?: string
  errorMessage?: string
}

/**
 * Send a fax via Twilio
 */
export async function sendFax(options: SendFaxOptions): Promise<SendFaxResult> {
  const { to, mediaUrl, documentPath, patientId, category } = options

  // Validate recipient number
  const toNumber = validateFaxNumber(to)
  if (!toNumber) {
    return {
      success: false,
      errorMessage: 'Invalid fax number format',
    }
  }

  // Get media URL
  let faxMediaUrl = mediaUrl
  if (!faxMediaUrl && documentPath) {
    // In production, this would be a publicly accessible URL
    // For now, we'll need to host the file or use a signed URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    faxMediaUrl = `${baseUrl}/api/fax/media/${encodeURIComponent(documentPath)}`
  }

  if (!faxMediaUrl) {
    return {
      success: false,
      errorMessage: 'Media URL or document path is required',
    }
  }

  // Check if Twilio is configured
  if (!isConfigured()) {
    // Return mock result for development
    const mockSid = `MOCK-FAX-${Date.now()}`

    // Save mock fax record
    const faxMessage = await prisma.faxMessage.create({
      data: {
        direction: 'OUTBOUND',
        status: 'SENT',
        twilioSid: mockSid,
        fromNumber: '+15555555555',
        toNumber,
        documentPath,
        patientId,
        category,
        sentAt: new Date(),
      },
    })

    return {
      success: true,
      faxId: faxMessage.id,
      twilioSid: mockSid,
      status: 'queued',
    }
  }

  try {
    const client = getClient()
    const config = getConfig()

    if (!client || !config) {
      return {
        success: false,
        errorMessage: 'Twilio client not available',
      }
    }

    // Send fax via Twilio
    const fax = await client.fax.v1.faxes.create({
      from: config.faxNumber,
      to: toNumber,
      mediaUrl: faxMediaUrl,
      statusCallback: config.webhookUrl ? `${config.webhookUrl}/api/fax/status` : undefined,
    })

    // Save fax record
    const faxMessage = await prisma.faxMessage.create({
      data: {
        direction: 'OUTBOUND',
        status: 'SENDING',
        twilioSid: fax.sid,
        fromNumber: config.faxNumber,
        toNumber,
        numPages: fax.numPages || undefined,
        documentPath,
        patientId,
        category,
        sentAt: new Date(),
      },
    })

    return {
      success: true,
      faxId: faxMessage.id,
      twilioSid: fax.sid,
      status: fax.status,
    }
  } catch (error) {
    console.error('Failed to send fax:', error)

    // Save failed fax record
    const faxMessage = await prisma.faxMessage.create({
      data: {
        direction: 'OUTBOUND',
        status: 'FAILED',
        fromNumber: getConfig()?.faxNumber || '',
        toNumber,
        documentPath,
        patientId,
        category,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return {
      success: false,
      faxId: faxMessage.id,
      errorMessage: error instanceof Error ? error.message : 'Failed to send fax',
    }
  }
}

/**
 * Get fax status from Twilio
 */
export async function getFaxStatus(twilioSid: string): Promise<{
  status: string
  numPages?: number
  errorCode?: string
  errorMessage?: string
}> {
  if (!isConfigured()) {
    return { status: 'delivered' } // Mock for development
  }

  try {
    const client = getClient()
    if (!client) {
      throw new Error('Twilio client not available')
    }

    const fax = await client.fax.v1.faxes(twilioSid).fetch()

    return {
      status: fax.status,
      numPages: fax.numPages || undefined,
      errorCode: fax.errorCode?.toString(),
      errorMessage: fax.errorMessage || undefined,
    }
  } catch (error) {
    console.error('Failed to get fax status:', error)
    throw error
  }
}

/**
 * Cancel a pending fax
 */
export async function cancelFax(twilioSid: string): Promise<boolean> {
  if (!isConfigured()) {
    return true // Mock for development
  }

  try {
    const client = getClient()
    if (!client) {
      throw new Error('Twilio client not available')
    }

    await client.fax.v1.faxes(twilioSid).update({ status: 'canceled' })
    return true
  } catch (error) {
    console.error('Failed to cancel fax:', error)
    return false
  }
}
