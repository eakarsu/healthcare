import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Check if encounter exists
    const existingEncounter = await prisma.encounter.findUnique({
      where: { id },
      include: {
        diagnoses: true,
        procedures: true,
      },
    })

    if (!existingEncounter) {
      return apiError('Encounter not found', 404)
    }

    if (existingEncounter.status === 'SIGNED' || existingEncounter.status === 'LOCKED') {
      return apiError('Encounter is already signed', 400)
    }

    // Validate encounter has required fields
    if (!existingEncounter.subjective || !existingEncounter.objective ||
        !existingEncounter.assessment || !existingEncounter.plan) {
      return apiError('All SOAP note sections are required before signing', 400)
    }

    if (existingEncounter.diagnoses.length === 0) {
      return apiError('At least one diagnosis is required before signing', 400)
    }

    // Sign the encounter
    const encounter = await prisma.encounter.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: session.user.id,
      },
      include: {
        patient: true,
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        diagnoses: true,
        procedures: true,
      },
    })

    // Update appointment status to completed
    if (encounter.appointmentId) {
      await prisma.appointment.update({
        where: { id: encounter.appointmentId },
        data: { status: 'COMPLETED' },
      })
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Encounter',
      entityId: encounter.id,
      patientId: encounter.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(encounter)
  } catch (error) {
    console.error('Failed to sign encounter:', error)
    return apiError('Failed to sign encounter', 500)
  }
}
