import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { validateRequest } from 'twilio'

/**
 * POST /api/fax/status - Fax status callback from Twilio
 */
export async function POST(request: NextRequest) {
  try {
    // Get Twilio signature for validation
    const twilioSignature = request.headers.get('x-twilio-signature') || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN

    // Parse form data
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // Validate webhook signature in production
    if (authToken && process.env.NODE_ENV === 'production') {
      const webhookUrl = process.env.TWILIO_FAX_WEBHOOK_URL + '/api/fax/status'
      const isValid = validateRequest(authToken, twilioSignature, webhookUrl, body)

      if (!isValid) {
        console.warn('Invalid Twilio status callback signature')
        return new Response('Invalid signature', { status: 403 })
      }
    }

    // Extract status data
    const faxSid = body.FaxSid || body.faxSid
    const status = body.Status || body.status
    const numPages = body.NumPages ? parseInt(body.NumPages) : undefined
    const errorCode = body.ErrorCode
    const errorMessage = body.ErrorMessage

    if (!faxSid) {
      return new Response('Missing FaxSid', { status: 400 })
    }

    console.log('Fax status update:', {
      faxSid,
      status,
      errorCode,
      errorMessage,
    })

    // Update fax record
    const faxMessage = await prisma.faxMessage.findFirst({
      where: { twilioSid: faxSid },
    })

    if (faxMessage) {
      await prisma.faxMessage.update({
        where: { id: faxMessage.id },
        data: {
          status: mapTwilioStatus(status),
          numPages,
          errorMessage: errorMessage || (errorCode ? `Error code: ${errorCode}` : undefined),
          ...(status === 'delivered' && { sentAt: new Date() }),
        },
      })
    }

    // Return empty response
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Fax status callback error:', error)
    return new Response('OK', { status: 200 }) // Return OK to prevent retries
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
