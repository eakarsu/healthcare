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

    const where: any = { patientId: params.id }
    if (status) {
      where.status = status
    }

    const conditions = await prisma.condition.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { onsetDate: 'desc' },
      ],
    })

    return NextResponse.json({ data: conditions })
  } catch (error) {
    console.error('Error fetching patient conditions:', error)
    return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 })
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
      icdCode,
      onsetDate,
      resolvedDate,
      notes,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Condition name is required' },
        { status: 400 }
      )
    }

    const condition = await prisma.condition.create({
      data: {
        patientId: params.id,
        name,
        icdCode,
        onsetDate: onsetDate ? new Date(onsetDate) : null,
        resolvedDate: resolvedDate ? new Date(resolvedDate) : null,
        notes,
        status: 'active',
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'CONDITION',
        entityId: condition.id,
        changes: {
          patientId: params.id,
          conditionName: name,
          icdCode,
        },
      },
    })

    return NextResponse.json(condition, { status: 201 })
  } catch (error) {
    console.error('Error creating condition:', error)
    return NextResponse.json({ error: 'Failed to create condition' }, { status: 500 })
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
    const conditionId = searchParams.get('conditionId')

    if (!conditionId) {
      return NextResponse.json({ error: 'Condition ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      icdCode,
      category,
      severity,
      resolvedDate,
      notes,
      status,
    } = body

    const condition = await prisma.condition.update({
      where: { id: conditionId },
      data: {
        ...(name && { name }),
        ...(icdCode !== undefined && { icdCode }),
        ...(category !== undefined && { category }),
        ...(severity !== undefined && { severity }),
        ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'CONDITION',
        entityId: conditionId,
        changes: {
          patientId: params.id,
          changes: body,
        },
      },
    })

    return NextResponse.json(condition)
  } catch (error) {
    console.error('Error updating condition:', error)
    return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 })
  }
}
