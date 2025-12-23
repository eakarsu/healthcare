import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { generateEncounterNumber, apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const patientId = url.searchParams.get('patientId')
    const providerId = url.searchParams.get('providerId')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const where: Record<string, unknown> = {
      appointment: {
        provider: {
          practiceId: session.user.practiceId,
        },
      },
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (providerId) {
      where.providerId = providerId
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.encounterDate = {}
      if (startDate) {
        (where.encounterDate as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.encounterDate as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [encounters, total] = await Promise.all([
      prisma.encounter.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mrn: true,
              dateOfBirth: true,
            },
          },
          provider: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          appointment: {
            include: {
              type: true,
            },
          },
          diagnoses: true,
          procedures: true,
        },
        orderBy: { encounterDate: 'desc' },
        take: limit,
        skip,
      }),
      prisma.encounter.count({ where }),
    ])

    return apiResponse({
      data: encounters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch encounters:', error)
    return apiError('Failed to fetch encounters', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: body.appointmentId },
      include: {
        patient: true,
        provider: true,
        type: true,
      },
    })

    if (!appointment) {
      return apiError('Appointment not found', 404)
    }

    // Create encounter
    const encounter = await prisma.encounter.create({
      data: {
        encounterNumber: generateEncounterNumber(),
        appointmentId: body.appointmentId,
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        encounterDate: new Date(),
        type: appointment.type?.name || body.type || 'Office Visit',
        status: 'IN_PROGRESS',
        chiefComplaint: body.chiefComplaint || appointment.chiefComplaint,
      },
      include: {
        patient: true,
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        appointment: {
          include: { type: true },
        },
      },
    })

    // Update appointment status
    await prisma.appointment.update({
      where: { id: body.appointmentId },
      data: { status: 'IN_PROGRESS' },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Encounter',
      entityId: encounter.id,
      patientId: encounter.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(encounter, 201)
  } catch (error) {
    console.error('Failed to create encounter:', error)
    return apiError('Failed to create encounter', 500)
  }
}
