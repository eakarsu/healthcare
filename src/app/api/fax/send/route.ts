import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { sendFax } from '@/lib/twilio-fax/send'
import { isConfigured } from '@/lib/twilio-fax/client'

/**
 * POST /api/fax/send - Send an outbound fax
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { to, mediaUrl, documentPath, patientId, category } = body
    const { ipAddress, userAgent } = extractRequestInfo(request)

    if (!to) {
      return apiError('Recipient fax number is required', 400)
    }

    if (!mediaUrl && !documentPath) {
      return apiError('Either mediaUrl or documentPath is required', 400)
    }

    // Send the fax
    const result = await sendFax({
      to,
      mediaUrl,
      documentPath,
      patientId,
      category,
    })

    if (!result.success) {
      return apiError(result.errorMessage || 'Failed to send fax', 500)
    }

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'FaxMessage',
      entityId: result.faxId || '',
      patientId,
      changes: {
        to,
        twilioSid: result.twilioSid,
        status: result.status,
      },
      ipAddress,
      userAgent,
      phiAccessed: !!patientId,
    })

    return apiResponse({
      success: true,
      faxId: result.faxId,
      twilioSid: result.twilioSid,
      status: result.status,
      isRealFax: isConfigured(),
    })
  } catch (error) {
    console.error('Failed to send fax:', error)
    return apiError('Failed to send fax', 500)
  }
}
