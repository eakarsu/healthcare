import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const providerId = searchParams.get('providerId')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (providerId) {
      where.providerId = providerId
    }

    const waitlist = await prisma.waitlistEntry.findMany({
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
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({ data: waitlist })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      patientId,
      appointmentTypeId,
      providerId,
      priority = 'NORMAL',
      reason,
      notes,
      preferredDays,
      preferredTimeStart,
      preferredTimeEnd,
    } = body

    if (!patientId || !appointmentTypeId || !reason) {
      return NextResponse.json(
        { error: 'Patient, appointment type, and reason are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        patientId,
        appointmentTypeId,
        providerId: providerId || null,
        priority,
        reason,
        notes,
        preferredDays: preferredDays || [],
        preferredTimeStart,
        preferredTimeEnd,
        status: 'WAITING',
      },
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
        action: 'CREATE',
        entity: 'WAITLIST',
        entityId: entry.id,
        changes: {
          patientName: `${entry.patient.firstName} ${entry.patient.lastName}`,
          appointmentType: entry.appointmentType.name,
          priority,
        },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating waitlist entry:', error)
    return NextResponse.json({ error: 'Failed to create waitlist entry' }, { status: 500 })
  }
}
