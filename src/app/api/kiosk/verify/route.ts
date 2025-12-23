import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { getKioskSession, updateKioskSession } from '@/lib/kiosk/session'
import { verifyPatient, VerificationMethod } from '@/lib/kiosk/verification'

/**
 * POST /api/kiosk/verify - Verify patient identity
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session) {
      return apiError('Session not found or expired', 404)
    }

    const body = await request.json()
    const {
      method,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      last4SSN,
      barcode,
    } = body

    if (!method) {
      return apiError('Verification method is required', 400)
    }

    // Verify patient
    const result = await verifyPatient({
      method: method as VerificationMethod,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      last4SSN,
      barcode,
      appointmentId: session.appointmentId,
    })

    if (!result.success) {
      return apiResponse({
        success: false,
        message: result.message,
      })
    }

    // Update session with verified patient info
    await updateKioskSession(sessionToken, {
      status: 'DEMOGRAPHICS',
      patientId: result.patientId,
      appointmentId: result.appointmentId || session.appointmentId,
      verificationMethod: method,
      verifiedAt: new Date(),
    })

    return apiResponse({
      success: true,
      patient: result.patient,
      appointment: result.appointment,
      nextStep: 'demographics',
    })
  } catch (error) {
    console.error('Failed to verify patient:', error)
    return apiError('Failed to verify patient', 500)
  }
}
