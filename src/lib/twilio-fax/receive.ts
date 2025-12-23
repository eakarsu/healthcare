import { getClient, getConfig, isConfigured } from './client'
import { prisma } from '@/lib/prisma'
import { saveDocument } from '@/lib/document-storage/storage'
import axios from 'axios'

export interface IncomingFaxData {
  faxSid: string
  from: string
  to: string
  numPages?: number
  mediaUrl?: string
  status: string
}

/**
 * Process incoming fax
 */
export async function processIncomingFax(data: IncomingFaxData): Promise<{
  success: boolean
  faxId?: string
  errorMessage?: string
}> {
  const { faxSid, from, to, numPages, mediaUrl, status } = data

  try {
    // Check if we already processed this fax
    const existingFax = await prisma.faxMessage.findFirst({
      where: { twilioSid: faxSid },
    })

    if (existingFax) {
      // Update status if needed
      if (existingFax.status !== mapTwilioStatus(status)) {
        await prisma.faxMessage.update({
          where: { id: existingFax.id },
          data: { status: mapTwilioStatus(status) },
        })
      }
      return { success: true, faxId: existingFax.id }
    }

    // Download the fax media if available
    let documentPath: string | undefined
    if (mediaUrl && status === 'received') {
      documentPath = await downloadFaxMedia(faxSid, mediaUrl)
    }

    // Create fax record
    const faxMessage = await prisma.faxMessage.create({
      data: {
        direction: 'INBOUND',
        status: mapTwilioStatus(status),
        twilioSid: faxSid,
        twilioMediaUrl: mediaUrl,
        fromNumber: from,
        toNumber: to,
        numPages,
        documentPath,
        receivedAt: new Date(),
      },
    })

    return {
      success: true,
      faxId: faxMessage.id,
    }
  } catch (error) {
    console.error('Failed to process incoming fax:', error)
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Download fax media from Twilio
 */
async function downloadFaxMedia(
  faxSid: string,
  mediaUrl: string
): Promise<string | undefined> {
  try {
    const config = getConfig()
    if (!config) {
      console.warn('Twilio not configured, skipping media download')
      return undefined
    }

    // Download the PDF from Twilio (requires authentication)
    const response = await axios.get(mediaUrl, {
      auth: {
        username: config.accountSid,
        password: config.authToken,
      },
      responseType: 'arraybuffer',
    })

    // Save to document storage
    const buffer = Buffer.from(response.data)
    const filename = `fax-${faxSid}.pdf`

    const savedDoc = await saveDocument({
      buffer,
      filename,
      mimeType: 'application/pdf',
      category: 'FAX',
      documentType: 'INCOMING_FAX',
    })

    return savedDoc.path
  } catch (error) {
    console.error('Failed to download fax media:', error)
    return undefined
  }
}

/**
 * Map Twilio status to internal status
 */
function mapTwilioStatus(
  twilioStatus: string
): 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'RECEIVED' | 'FAILED' {
  const statusMap: Record<string, 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'RECEIVED' | 'FAILED'> = {
    queued: 'PENDING',
    processing: 'SENDING',
    sending: 'SENDING',
    delivered: 'DELIVERED',
    receiving: 'PENDING',
    received: 'RECEIVED',
    'no-answer': 'FAILED',
    busy: 'FAILED',
    failed: 'FAILED',
    canceled: 'FAILED',
  }
  return statusMap[twilioStatus] || 'PENDING'
}

/**
 * Delete fax media from Twilio (after saving locally)
 */
export async function deleteFaxMedia(faxSid: string): Promise<boolean> {
  if (!isConfigured()) {
    return true
  }

  try {
    const client = getClient()
    if (!client) {
      throw new Error('Twilio client not available')
    }

    // Get fax media and delete it
    const media = await client.fax.v1.faxes(faxSid).media.list()
    for (const item of media) {
      await client.fax.v1.faxes(faxSid).media(item.sid).remove()
    }

    return true
  } catch (error) {
    console.error('Failed to delete fax media:', error)
    return false
  }
}

/**
 * List recent incoming faxes
 */
export async function listIncomingFaxes(options: {
  limit?: number
  after?: Date
} = {}): Promise<IncomingFaxData[]> {
  if (!isConfigured()) {
    return [] // Return empty for development
  }

  try {
    const client = getClient()
    if (!client) {
      throw new Error('Twilio client not available')
    }

    const faxes = await client.fax.v1.faxes.list({
      direction: 'inbound',
      pageSize: options.limit || 50,
      ...(options.after && { dateCreatedAfter: options.after }),
    })

    return faxes.map((fax) => ({
      faxSid: fax.sid,
      from: fax.from || '',
      to: fax.to || '',
      numPages: fax.numPages || undefined,
      mediaUrl: fax.mediaUrl || undefined,
      status: fax.status,
    }))
  } catch (error) {
    console.error('Failed to list incoming faxes:', error)
    return []
  }
}
