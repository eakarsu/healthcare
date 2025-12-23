import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(
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

    const encounter = await prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            allergies: true,
            medications: { where: { endDate: null } },
            conditions: { where: { status: 'ACTIVE' } },
            insurances: {
              include: { insurancePlan: true },
            },
          },
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        appointment: {
          include: {
            type: true,
            location: true,
            room: true,
          },
        },
        diagnoses: true,
        procedures: true,
        orders: true,
      },
    })

    if (!encounter) {
      return apiError('Encounter not found', 404)
    }

    // Create audit log for PHI access
    await createAuditLog({
      userId: session.user.id,
      action: 'READ',
      entity: 'Encounter',
      entityId: encounter.id,
      patientId: encounter.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(encounter)
  } catch (error) {
    console.error('Failed to fetch encounter:', error)
    return apiError('Failed to fetch encounter', 500)
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

    const { id } = await params
    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Check if encounter exists and is editable
    const existingEncounter = await prisma.encounter.findUnique({
      where: { id },
    })

    if (!existingEncounter) {
      return apiError('Encounter not found', 404)
    }

    if (existingEncounter.status === 'SIGNED' || existingEncounter.status === 'LOCKED') {
      return apiError('Cannot modify a signed or locked encounter', 400)
    }

    // Update encounter
    const updateData: Record<string, unknown> = {}

    if (body.chiefComplaint !== undefined) updateData.chiefComplaint = body.chiefComplaint
    if (body.subjective !== undefined) updateData.subjective = body.subjective
    if (body.objective !== undefined) updateData.objective = body.objective
    if (body.assessment !== undefined) updateData.assessment = body.assessment
    if (body.plan !== undefined) updateData.plan = body.plan
    if (body.instructions !== undefined) updateData.instructions = body.instructions
    if (body.followUp !== undefined) updateData.followUp = body.followUp

    // Handle vitals - stored directly on encounter
    if (body.vitals) {
      if (body.vitals.bloodPressureSystolic !== undefined) updateData.bloodPressureSystolic = body.vitals.bloodPressureSystolic
      if (body.vitals.bloodPressureDiastolic !== undefined) updateData.bloodPressureDiastolic = body.vitals.bloodPressureDiastolic
      if (body.vitals.heartRate !== undefined) updateData.heartRate = body.vitals.heartRate
      if (body.vitals.temperature !== undefined) updateData.temperature = body.vitals.temperature
      if (body.vitals.respiratoryRate !== undefined) updateData.respiratoryRate = body.vitals.respiratoryRate
      if (body.vitals.oxygenSaturation !== undefined) updateData.oxygenSaturation = body.vitals.oxygenSaturation
      if (body.vitals.height !== undefined) updateData.height = body.vitals.height
      if (body.vitals.weight !== undefined) updateData.weight = body.vitals.weight
      if (body.vitals.painLevel !== undefined) updateData.painLevel = body.vitals.painLevel
    }

    // Handle diagnoses
    if (body.diagnoses) {
      // Remove existing diagnoses
      await prisma.encounterDiagnosis.deleteMany({
        where: { encounterId: id },
      })

      // Add new diagnoses
      if (body.diagnoses.length > 0) {
        await prisma.encounterDiagnosis.createMany({
          data: body.diagnoses.map((dx: { icdCode: string; description: string; isPrimary?: boolean }, index: number) => ({
            encounterId: id,
            icdCode: dx.icdCode,
            description: dx.description,
            isPrimary: dx.isPrimary || index === 0,
            sequence: index + 1,
          })),
        })
      }
    }

    // Handle procedures
    if (body.procedures) {
      // Remove existing procedures
      await prisma.encounterProcedure.deleteMany({
        where: { encounterId: id },
      })

      // Add new procedures
      if (body.procedures.length > 0) {
        await prisma.encounterProcedure.createMany({
          data: body.procedures.map((proc: { cptCode: string; description: string; quantity?: number; modifier?: string }) => ({
            encounterId: id,
            cptCode: proc.cptCode,
            description: proc.description,
            quantity: proc.quantity || 1,
            modifier: proc.modifier || null,
          })),
        })
      }
    }

    const encounter = await prisma.encounter.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        diagnoses: true,
        procedures: true,
        orders: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Encounter',
      entityId: encounter.id,
      patientId: encounter.patientId,
      changes: body,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(encounter)
  } catch (error) {
    console.error('Failed to update encounter:', error)
    return apiError('Failed to update encounter', 500)
  }
}
