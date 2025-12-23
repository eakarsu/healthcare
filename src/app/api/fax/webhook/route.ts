import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/utils'
import { processIncomingFax } from '@/lib/twilio-fax/receive'
import { validateRequest } from 'twilio'

/**
 * POST /api/fax/webhook - Receive incoming fax webhook from Twilio
 */
export async function POST(request: NextRequest) {
  try {
    // Get Twilio signature for validation
    const twilioSignature = request.headers.get('x-twilio-signature') || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN

    // Parse form data (Twilio sends webhooks as form data)
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // Validate webhook signature in production
    if (authToken && process.env.NODE_ENV === 'production') {
      const webhookUrl = process.env.TWILIO_FAX_WEBHOOK_URL + '/api/fax/webhook'
      const isValid = validateRequest(authToken, twilioSignature, webhookUrl, body)

      if (!isValid) {
        console.warn('Invalid Twilio webhook signature')
        return new Response('Invalid signature', { status: 403 })
      }
    }

    // Extract fax data from webhook
    const faxData = {
      faxSid: body.FaxSid || body.faxSid || '',
      from: body.From || body.from || '',
      to: body.To || body.to || '',
      numPages: body.NumPages ? parseInt(body.NumPages) : undefined,
      mediaUrl: body.MediaUrl || body.mediaUrl,
      status: body.Status || body.status || 'received',
    }

    console.log('Received fax webhook:', {
      faxSid: faxData.faxSid,
      from: faxData.from,
      status: faxData.status,
    })

    // Process the incoming fax
    const result = await processIncomingFax(faxData)

    if (!result.success) {
      console.error('Failed to process incoming fax:', result.errorMessage)
    }

    // Return TwiML response (empty for fax)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  } catch (error) {
    console.error('Fax webhook error:', error)
    // Still return success to prevent Twilio retries
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }
}

/**
 * GET /api/fax/webhook - Verify webhook endpoint
 */
export async function GET() {
  return apiResponse({
    status: 'active',
    message: 'Fax webhook endpoint is active',
  })
}
