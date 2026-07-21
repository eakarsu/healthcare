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

    const allergies = await prisma.allergy.findMany({
      where: { patientId: (await params).id },
      orderBy: [
        { severity: 'desc' },
        { allergen: 'asc' },
      ],
    })

    return NextResponse.json({ data: allergies })
  } catch (error) {
    console.error('Error fetching patient allergies:', error)
    return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 })
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
      allergen,
      severity,
      reaction,
      onsetDate,
      notes,
    } = body

    if (!allergen || !severity) {
      return NextResponse.json(
        { error: 'Allergen and severity are required' },
        { status: 400 }
      )
    }

    const allergy = await prisma.allergy.create({
      data: {
        patientId: (await params).id,
        allergen,
        severity,
        reaction,
        onsetDate: onsetDate ? new Date(onsetDate) : null,
        notes,
        status: 'active',
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'ALLERGY',
        entityId: allergy.id,
        changes: {
          patientId: (await params).id,
          allergen,
          severity,
        },
      },
    })

    return NextResponse.json(allergy, { status: 201 })
  } catch (error) {
    console.error('Error creating allergy:', error)
    return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 })
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

    const searchParams = request.nextUrl.searchParams
    const allergyId = searchParams.get('allergyId')

    if (!allergyId) {
      return NextResponse.json({ error: 'Allergy ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      allergen,
      severity,
      reaction,
      onsetDate,
      notes,
      status,
    } = body

    const allergy = await prisma.allergy.update({
      where: { id: allergyId },
      data: {
        ...(allergen && { allergen }),
        ...(severity && { severity }),
        ...(reaction !== undefined && { reaction }),
        ...(onsetDate !== undefined && { onsetDate: onsetDate ? new Date(onsetDate) : null }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'ALLERGY',
        entityId: allergyId,
        changes: {
          patientId: (await params).id,
          changes: body,
        },
      },
    })

    return NextResponse.json(allergy)
  } catch (error) {
    console.error('Error updating allergy:', error)
    return NextResponse.json({ error: 'Failed to update allergy' }, { status: 500 })
  }
}
