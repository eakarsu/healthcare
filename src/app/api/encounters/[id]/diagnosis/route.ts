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

    const diagnoses = await prisma.encounterDiagnosis.findMany({
      where: { encounterId: params.id },
      orderBy: { sequence: 'asc' },
    })

    return NextResponse.json({ data: diagnoses })
  } catch (error) {
    console.error('Error fetching diagnoses:', error)
    return NextResponse.json({ error: 'Failed to fetch diagnoses' }, { status: 500 })
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
    const { icdCode, description, sequence, notes } = body

    if (!icdCode || !description) {
      return NextResponse.json(
        { error: 'ICD code and description are required' },
        { status: 400 }
      )
    }

    // Get next sequence number if not provided
    let diagnosisSequence = sequence
    if (!diagnosisSequence) {
      const lastDiagnosis = await prisma.encounterDiagnosis.findFirst({
        where: { encounterId: params.id },
        orderBy: { sequence: 'desc' },
      })
      diagnosisSequence = (lastDiagnosis?.sequence || 0) + 1
    }

    const diagnosis = await prisma.encounterDiagnosis.create({
      data: {
        encounterId: params.id,
        icdCode,
        description,
        sequence: diagnosisSequence,
        notes,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'ENCOUNTER_DIAGNOSIS',
        entityId: diagnosis.id,
        changes: {
          encounterId: params.id,
          icdCode,
          description,
        },
      },
    })

    return NextResponse.json(diagnosis, { status: 201 })
  } catch (error) {
    console.error('Error creating diagnosis:', error)
    return NextResponse.json({ error: 'Failed to create diagnosis' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const diagnosisId = searchParams.get('diagnosisId')

    if (!diagnosisId) {
      return NextResponse.json({ error: 'Diagnosis ID is required' }, { status: 400 })
    }

    await prisma.encounterDiagnosis.delete({
      where: { id: diagnosisId },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'ENCOUNTER_DIAGNOSIS',
        entityId: diagnosisId,
        changes: { encounterId: params.id },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting diagnosis:', error)
    return NextResponse.json({ error: 'Failed to delete diagnosis' }, { status: 500 })
  }
}
