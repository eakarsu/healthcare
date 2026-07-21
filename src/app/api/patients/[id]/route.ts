import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo, getChanges } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const patient = await prisma.patient.findFirst({
      where: {
        id: (await params).id,
        practiceId: session.user.practiceId,
      },
      include: {
        insurances: {
          include: {
            insurancePlan: true,
          },
          orderBy: { priority: 'asc' },
        },
        allergies: {
          where: { status: 'active' },
          orderBy: { severity: 'desc' },
        },
        medications: {
          orderBy: { status: 'asc' },
        },
        conditions: {
          orderBy: { status: 'asc' },
        },
        appointments: {
          include: {
            type: true,
            provider: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { scheduledStart: 'desc' },
          take: 10,
        },
        encounters: {
          include: {
            diagnoses: {
              orderBy: { sequence: 'asc' },
            },
            procedures: true,
            provider: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { encounterDate: 'desc' },
          take: 20,
        },
        claims: {
          include: {
            lines: true,
            payments: true,
            insurancePlan: true,
          },
          orderBy: { serviceDate: 'desc' },
          take: 20,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    // Decrypt SSN if present
    if (patient.ssn) {
      try {
        patient.ssn = decrypt(patient.ssn)
      } catch {
        // Leave as is if decryption fails
      }
    }

    // Create audit log for PHI access (non-blocking)
    createAuditLog({
      userId: session.user.id,
      action: 'READ',
      entity: 'Patient',
      entityId: patient.id,
      patientId: patient.id,
      ipAddress,
      userAgent,
      phiAccessed: true,
    }).catch(err => console.error('Audit log failed:', err))

    return apiResponse(patient)
  } catch (error) {
    console.error('Failed to fetch patient:', error)
    return apiError('Failed to fetch patient', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)
    const body = await request.json()

    // Get current patient data for audit
    const currentPatient = await prisma.patient.findFirst({
      where: {
        id: (await params).id,
        practiceId: session.user.practiceId,
      },
    })

    if (!currentPatient) {
      return apiError('Patient not found', 404)
    }

    // Prepare update data
    const updateData = { ...body }
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }
    if (updateData.ssn) {
      updateData.ssn = encrypt(updateData.ssn)
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.mrn
    delete updateData.practiceId
    delete updateData.createdAt

    const patient = await prisma.patient.update({
      where: { id: (await params).id },
      data: updateData,
    })

    // Get changes for audit
    const changes = getChanges(currentPatient as Record<string, unknown>, patient as Record<string, unknown>, ['ssn'])

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: patient.id,
      patientId: patient.id,
      changes: changes || undefined,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(patient)
  } catch (error) {
    console.error('Failed to update patient:', error)
    return apiError('Failed to update patient', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    // Only admin can delete patients
    if (session.user.role !== 'ADMIN') {
      return apiError('Forbidden', 403)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const patient = await prisma.patient.findFirst({
      where: {
        id: (await params).id,
        practiceId: session.user.practiceId,
      },
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    // Soft delete by updating status
    await prisma.patient.update({
      where: { id: (await params).id },
      data: { status: 'INACTIVE' },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Patient',
      entityId: patient.id,
      patientId: patient.id,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete patient:', error)
    return apiError('Failed to delete patient', 500)
  }
}
