import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

// Bulk cancel appointments
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No appointment IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot cancel more than 50 appointments at once', 400)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const appointments = await prisma.appointment.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (appointments.length !== ids.length) {
      return apiError('Some appointments were not found', 400)
    }

    // Only allow cancelling future appointments that aren't completed
    const completedAppts = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status))
    if (completedAppts.length > 0) {
      return apiError('Cannot cancel completed or already cancelled appointments', 400)
    }

    await prisma.appointment.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: 'CANCELLED' },
    })

    for (const appt of appointments) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_CANCEL',
        entity: 'Appointment',
        entityId: appt.id,
        ipAddress,
        userAgent,
      })
    }

    return apiResponse({
      message: `${appointments.length} appointments cancelled successfully`,
      count: appointments.length,
    })
  } catch (error) {
    console.error('Bulk cancel appointments error:', error)
    return apiError('Failed to bulk cancel appointments', 500)
  }
}

// Bulk update appointment status
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ids, data } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No appointment IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot update more than 50 appointments at once', 400)
    }

    if (!data || !data.status) {
      return apiError('Status is required for bulk update', 400)
    }

    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(data.status)) {
      return apiError('Invalid status value', 400)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const appointments = await prisma.appointment.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (appointments.length !== ids.length) {
      return apiError('Some appointments were not found', 400)
    }

    await prisma.appointment.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: data.status },
    })

    for (const appt of appointments) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_UPDATE',
        entity: 'Appointment',
        entityId: appt.id,
        changes: { status: data.status },
        ipAddress,
        userAgent,
      })
    }

    return apiResponse({
      message: `${appointments.length} appointments updated successfully`,
      count: appointments.length,
    })
  } catch (error) {
    console.error('Bulk update appointments error:', error)
    return apiError('Failed to bulk update appointments', 500)
  }
}
