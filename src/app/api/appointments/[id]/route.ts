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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            dateOfBirth: true,
            phone: true,
            email: true,
          },
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        type: true,
        location: true,
        room: true,
        encounter: true,
      },
    })

    if (!appointment) {
      return apiError('Appointment not found', 404)
    }

    return apiResponse(appointment)
  } catch (error) {
    console.error('Failed to fetch appointment:', error)
    return apiError('Failed to fetch appointment', 500)
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

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existingAppointment) {
      return apiError('Appointment not found', 404)
    }

    const updateData: Record<string, unknown> = {}

    if (body.scheduledStart) updateData.scheduledStart = new Date(body.scheduledStart)
    if (body.scheduledEnd) updateData.scheduledEnd = new Date(body.scheduledEnd)
    if (body.status) updateData.status = body.status
    if (body.providerId) updateData.providerId = body.providerId
    if (body.locationId) updateData.locationId = body.locationId
    if (body.roomId !== undefined) updateData.roomId = body.roomId
    if (body.typeId) updateData.typeId = body.typeId
    if (body.chiefComplaint !== undefined) updateData.chiefComplaint = body.chiefComplaint
    if (body.notes !== undefined) updateData.notes = body.notes

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        type: true,
        location: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: appointment.id,
      patientId: appointment.patientId,
      changes: body,
      ipAddress,
      userAgent,
      phiAccessed: false,
    })

    return apiResponse(appointment)
  } catch (error) {
    console.error('Failed to update appointment:', error)
    return apiError('Failed to update appointment', 500)
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

    const { id } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return apiError('Appointment not found', 404)
    }

    // Soft delete by updating status
    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Appointment',
      entityId: id,
      patientId: appointment.patientId,
      ipAddress,
      userAgent,
      phiAccessed: false,
    })

    return apiResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete appointment:', error)
    return apiError('Failed to delete appointment', 500)
  }
}
