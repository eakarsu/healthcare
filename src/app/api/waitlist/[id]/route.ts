import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: (await params).id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            phone: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching waitlist entry:', error)
    return NextResponse.json({ error: 'Failed to fetch waitlist entry' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      status,
      priority,
      providerId,
      notes,
      preferredDays,
      preferredTimeStart,
      preferredTimeEnd,
    } = body

    const existing = await prisma.waitlistEntry.findUnique({
      where: { id: (await params).id },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (providerId !== undefined) updateData.providerId = providerId
    if (notes !== undefined) updateData.notes = notes
    if (preferredDays !== undefined) updateData.preferredDays = preferredDays
    if (preferredTimeStart !== undefined) updateData.preferredTimeStart = preferredTimeStart
    if (preferredTimeEnd !== undefined) updateData.preferredTimeEnd = preferredTimeEnd

    const entry = await prisma.waitlistEntry.update({
      where: { id: (await params).id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
          },
        },
        appointmentType: {
          select: {
            name: true,
          },
        },
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'WAITLIST',
        entityId: entry.id,
        changes: {
          patientName: `${entry.patient.firstName} ${entry.patient.lastName}`,
          changes: updateData,
        },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating waitlist entry:', error)
    return NextResponse.json({ error: 'Failed to update waitlist entry' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.waitlistEntry.findUnique({
      where: { id: (await params).id },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    await prisma.waitlistEntry.delete({
      where: { id: (await params).id },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'WAITLIST',
        entityId: (await params).id,
        changes: {
          patientName: `${existing.patient.firstName} ${existing.patient.lastName}`,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting waitlist entry:', error)
    return NextResponse.json({ error: 'Failed to delete waitlist entry' }, { status: 500 })
  }
}
