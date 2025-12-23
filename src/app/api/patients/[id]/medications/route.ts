import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { patientId: params.id }
    if (status) {
      where.status = status
    }

    const medications = await prisma.medication.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ data: medications })
  } catch (error) {
    console.error('Error fetching patient medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

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
    const {
      name,
      dosage,
      frequency,
      route,
      prescribedBy,
      prescribedDate,
      startDate,
      endDate,
      notes,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Medication name is required' },
        { status: 400 }
      )
    }

    const medication = await prisma.medication.create({
      data: {
        patientId: params.id,
        name,
        dosage,
        frequency,
        route,
        prescribedBy,
        prescribedDate: prescribedDate ? new Date(prescribedDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes,
        status: 'active',
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'MEDICATION',
        entityId: medication.id,
        changes: {
          patientId: params.id,
          medicationName: name,
          dosage,
          frequency,
        },
      },
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const medicationId = searchParams.get('medicationId')

    if (!medicationId) {
      return NextResponse.json({ error: 'Medication ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      dosage,
      frequency,
      route,
      endDate,
      notes,
      status,
    } = body

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...(name && { name }),
        ...(dosage !== undefined && { dosage }),
        ...(frequency !== undefined && { frequency }),
        ...(route !== undefined && { route }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'MEDICATION',
        entityId: medicationId,
        changes: {
          patientId: params.id,
          changes: body,
        },
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 })
  }
}
