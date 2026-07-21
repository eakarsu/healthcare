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

    const procedures = await prisma.encounterProcedure.findMany({
      where: { encounterId: (await params).id },
      include: {
        service: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ data: procedures })
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 })
  }
}

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
    const {
      cptCode,
      description,
      quantity,
      modifiers,
      units,
      serviceId,
      toothNumber,
      surface,
      notes,
    } = body

    if (!cptCode || !description) {
      return NextResponse.json(
        { error: 'CPT code and description are required' },
        { status: 400 }
      )
    }

    const procedure = await prisma.encounterProcedure.create({
      data: {
        encounterId: (await params).id,
        cptCode,
        description,
        quantity: quantity || 1,
        modifiers: modifiers || [],
        units: units || 1,
        serviceId,
        toothNumber,
        surface,
        notes,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'ENCOUNTER_PROCEDURE',
        entityId: procedure.id,
        changes: {
          encounterId: (await params).id,
          cptCode,
          description,
        },
      },
    })

    return NextResponse.json(procedure, { status: 201 })
  } catch (error) {
    console.error('Error creating procedure:', error)
    return NextResponse.json({ error: 'Failed to create procedure' }, { status: 500 })
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

    const searchParams = request.nextUrl.searchParams
    const procedureId = searchParams.get('procedureId')

    if (!procedureId) {
      return NextResponse.json({ error: 'Procedure ID is required' }, { status: 400 })
    }

    await prisma.encounterProcedure.delete({
      where: { id: procedureId },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'ENCOUNTER_PROCEDURE',
        entityId: procedureId,
        changes: { encounterId: (await params).id },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting procedure:', error)
    return NextResponse.json({ error: 'Failed to delete procedure' }, { status: 500 })
  }
}
