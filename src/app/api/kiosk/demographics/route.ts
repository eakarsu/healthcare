import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { getKioskSession, updateKioskSession } from '@/lib/kiosk/session'

/**
 * GET /api/kiosk/demographics - Get current patient demographics
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session || !session.patientId) {
      return apiError('Session not found or patient not verified', 404)
    }

    const patient = await prisma.patient.findUnique({
      where: { id: session.patientId },
      select: {
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        phone: true,
        mobilePhone: true,
        email: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelation: true,
      },
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    return apiResponse({
      demographics: {
        ...patient,
        dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error('Failed to get demographics:', error)
    return apiError('Failed to get demographics', 500)
  }
}

/**
 * PUT /api/kiosk/demographics - Update patient demographics
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session || !session.patientId) {
      return apiError('Session not found or patient not verified', 404)
    }

    const body = await request.json()
    const {
      address,
      city,
      state,
      zip,
      phone,
      mobilePhone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      noChanges, // If patient confirms no changes needed
    } = body

    // Update patient demographics
    if (!noChanges) {
      await prisma.patient.update({
        where: { id: session.patientId },
        data: {
          address,
          city,
          state,
          zip,
          phone,
          mobilePhone,
          email,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelation,
        },
      })
    }

    // Update session status
    await updateKioskSession(sessionToken, {
      status: 'INSURANCE',
      demographicsUpdated: true,
    })

    return apiResponse({
      success: true,
      message: noChanges ? 'Demographics confirmed' : 'Demographics updated',
      nextStep: 'insurance',
    })
  } catch (error) {
    console.error('Failed to update demographics:', error)
    return apiError('Failed to update demographics', 500)
  }
}
