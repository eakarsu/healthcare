import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const providerId = url.searchParams.get('providerId')
    const patientId = url.searchParams.get('patientId')
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = {}

    // Filter by provider's practice
    where.provider = {
      practiceId: session.user.practiceId,
    }

    if (startDate && endDate) {
      where.scheduledStart = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (providerId) {
      where.providerId = providerId
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    const { page, limit, skip } = getPaginationParams(request)

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mrn: true,
              phone: true,
            },
          },
          provider: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          type: true,
          location: {
            select: { id: true, name: true },
          },
          room: {
            select: { id: true, name: true },
          },
        },
        orderBy: { scheduledStart: 'asc' },
        take: limit,
        skip,
      }),
      prisma.appointment.count({ where }),
    ])

    return apiResponse({
      data: appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
    return apiError('Failed to fetch appointments', 500)
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

    // Get appointment type for duration
    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: body.appointmentTypeId },
    })

    if (!appointmentType) {
      return apiError('Invalid appointment type', 400)
    }

    const scheduledStart = new Date(body.scheduledStart)
    const scheduledEnd = new Date(scheduledStart.getTime() + appointmentType.duration * 60 * 1000)

    // Check for conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        providerId: body.providerId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          {
            scheduledStart: { lt: scheduledEnd },
            scheduledEnd: { gt: scheduledStart },
          },
        ],
      },
    })

    if (conflict) {
      return apiError('Time slot is not available', 400)
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        providerId: body.providerId,
        locationId: body.locationId,
        roomId: body.roomId || null,
        appointmentTypeId: body.appointmentTypeId,
        scheduledStart,
        scheduledEnd,
        chiefComplaint: body.chiefComplaint || null,
        notes: body.notes || null,
        isNewPatient: body.isNewPatient || false,
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
      patientId: body.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(appointment, 201)
  } catch (error) {
    console.error('Failed to create appointment:', error)
    return apiError('Failed to create appointment', 500)
  }
}
