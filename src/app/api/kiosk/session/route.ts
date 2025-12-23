import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { createKioskSession, getKioskSession } from '@/lib/kiosk/session'

/**
 * POST /api/kiosk/session - Start a new kiosk session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify kiosk API secret
    const apiSecret = request.headers.get('x-kiosk-secret')
    const expectedSecret = process.env.KIOSK_API_SECRET

    if (expectedSecret && apiSecret !== expectedSecret) {
      return apiError('Invalid kiosk API secret', 401)
    }

    const body = await request.json()
    const { deviceId, locationId, appointmentId } = body

    // Create new session
    const session = await createKioskSession(deviceId, locationId, appointmentId)

    return apiResponse({
      success: true,
      session: {
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
        status: session.status,
        appointmentId: session.appointmentId,
        expiresAt: session.expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create kiosk session:', error)
    return apiError('Failed to create kiosk session', 500)
  }
}

/**
 * GET /api/kiosk/session - Get current session status
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)

    if (!session) {
      return apiError('Session not found or expired', 404)
    }

    return apiResponse({
      session: {
        sessionId: session.sessionId,
        status: session.status,
        appointmentId: session.appointmentId,
        patientId: session.patientId,
        verified: !!session.verifiedAt,
        demographicsUpdated: session.demographicsUpdated,
        insuranceVerified: session.insuranceVerified,
        consentsSigned: session.consentsSigned,
        copayCollected: session.copayCollected,
        expiresAt: session.expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to get kiosk session:', error)
    return apiError('Failed to get kiosk session', 500)
  }
}
