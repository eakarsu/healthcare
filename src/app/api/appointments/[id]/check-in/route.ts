import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { verifiedInsurance, collectedCopay, copayAmount, notes } = body

    const appointment = await prisma.appointment.findUnique({
      where: { id: (await params).id },
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

    if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Appointment must be scheduled or confirmed to check in' },
        { status: 400 }
      )
    }

    const checkedInAt = new Date()

    const updatedAppointment = await prisma.appointment.update({
      where: { id: (await params).id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt,
        notes: notes ? `${appointment.notes || ''}\n\nCheck-in notes: ${notes}`.trim() : appointment.notes,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'APPOINTMENT',
        entityId: (await params).id,
        changes: {
          action: 'CHECK_IN',
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientMRN: appointment.patient.mrn,
          providerName: `Dr. ${appointment.provider.user.lastName}`,
          checkedInAt: checkedInAt.toISOString(),
          verifiedInsurance,
          collectedCopay,
          copayAmount,
        },
      },
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      checkedInAt,
    })
  } catch (error) {
    console.error('Error checking in appointment:', error)
    return NextResponse.json({ error: 'Failed to check in appointment' }, { status: 500 })
  }
}
