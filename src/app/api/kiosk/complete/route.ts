import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { getKioskSession, completeKioskSession } from '@/lib/kiosk/session'

/**
 * POST /api/kiosk/complete - Complete check-in process
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session || !session.patientId) {
      return apiError('Session not found or patient not verified', 404)
    }

    // Complete the session (updates appointment status)
    const completed = await completeKioskSession(sessionToken)

    if (!completed) {
      return apiError('Failed to complete check-in', 500)
    }

    // Get appointment details for confirmation
    let appointmentDetails = null
    if (session.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: session.appointmentId },
        include: {
          provider: {
            include: { user: true },
          },
          type: true,
          location: true,
          room: true,
        },
      })

      if (appointment) {
        appointmentDetails = {
          time: appointment.scheduledStart.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          provider: `${appointment.provider.user.firstName} ${appointment.provider.user.lastName}`,
          appointmentType: appointment.type?.name || 'General Visit',
          location: appointment.location?.name || 'Main Office',
          room: appointment.room?.name || null,
        }
      }
    }

    // Get patient name for confirmation
    const patient = await prisma.patient.findUnique({
      where: { id: session.patientId },
      select: { firstName: true, lastName: true },
    })

    return apiResponse({
      success: true,
      message: 'Check-in complete! Please have a seat and we will call you shortly.',
      confirmation: {
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient',
        appointment: appointmentDetails,
        checkedInAt: new Date().toISOString(),
        summary: {
          demographicsUpdated: session.demographicsUpdated,
          insuranceVerified: session.insuranceVerified,
          copayCollected: session.copayCollected,
        },
      },
    })
  } catch (error) {
    console.error('Failed to complete check-in:', error)
    return apiError('Failed to complete check-in', 500)
  }
}

/**
 * GET /api/kiosk/complete - Get check-in status for display
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

    // Get checklist status
    const checklist = {
      verified: !!session.verifiedAt,
      demographicsReviewed: session.demographicsUpdated,
      insuranceVerified: session.insuranceVerified,
      consentsSigned: session.consentsSigned,
      paymentHandled: session.copayCollected !== null || session.status === 'READY',
    }

    // Check if all required steps are complete
    const readyToComplete = checklist.verified && checklist.demographicsReviewed

    return apiResponse({
      sessionStatus: session.status,
      checklist,
      readyToComplete,
      currentStep: determineCurrentStep(checklist),
    })
  } catch (error) {
    console.error('Failed to get check-in status:', error)
    return apiError('Failed to get check-in status', 500)
  }
}

/**
 * Determine current step based on checklist
 */
function determineCurrentStep(checklist: {
  verified: boolean
  demographicsReviewed: boolean
  insuranceVerified: boolean
  consentsSigned: boolean
  paymentHandled: boolean
}): string {
  if (!checklist.verified) return 'verification'
  if (!checklist.demographicsReviewed) return 'demographics'
  if (!checklist.insuranceVerified) return 'insurance'
  if (!checklist.consentsSigned) return 'consents'
  if (!checklist.paymentHandled) return 'payment'
  return 'complete'
}
