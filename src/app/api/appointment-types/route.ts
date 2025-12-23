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

    const appointmentTypes = await prisma.appointmentType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: appointmentTypes })
  } catch (error) {
    console.error('Error fetching appointment types:', error)
    return NextResponse.json({ error: 'Failed to fetch appointment types' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create appointment types
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      code,
      duration,
      color,
      description,
    } = body

    if (!name || !duration) {
      return NextResponse.json(
        { error: 'Name and duration are required' },
        { status: 400 }
      )
    }

    const appointmentType = await prisma.appointmentType.create({
      data: {
        name,
        code,
        duration,
        color,
        description,
        isActive: true,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'APPOINTMENT_TYPE',
        entityId: appointmentType.id,
        changes: {
          name,
          duration,
        },
      },
    })

    return NextResponse.json(appointmentType, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment type:', error)
    return NextResponse.json({ error: 'Failed to create appointment type' }, { status: 500 })
  }
}
