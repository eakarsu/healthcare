import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { followUpRequired, followUpInstructions, nextAppointmentDate, notes } = body

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
          },
        },
        provider: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.status !== 'CHECKED_IN' && appointment.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Appointment must be checked in or in progress to check out' },
        { status: 400 }
      )
    }

    const checkedOutAt = new Date()

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        checkedOutAt,
        notes: notes ? `${appointment.notes || ''}\n\nCheck-out notes: ${notes}`.trim() : appointment.notes,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'APPOINTMENT',
        entityId: params.id,
        changes: {
          action: 'CHECK_OUT',
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientMRN: appointment.patient.mrn,
          providerName: `Dr. ${appointment.provider.user.lastName}`,
          checkedOutAt: checkedOutAt.toISOString(),
          followUpRequired,
          followUpInstructions,
          nextAppointmentDate,
        },
      },
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      checkedOutAt,
      followUpRequired,
    })
  } catch (error) {
    console.error('Error checking out appointment:', error)
    return NextResponse.json({ error: 'Failed to check out appointment' }, { status: 500 })
  }
}
