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

    const insurance = await prisma.patientInsurance.findMany({
      where: { patientId: params.id },
      include: {
        insurancePlan: {
          select: {
            id: true,
            name: true,
            payerId: true,
            planType: true,
          },
        },
      },
      orderBy: { priority: 'asc' },
    })

    return NextResponse.json({ data: insurance })
  } catch (error) {
    console.error('Error fetching patient insurance:', error)
    return NextResponse.json({ error: 'Failed to fetch insurance' }, { status: 500 })
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
      insurancePlanId,
      subscriberId,
      subscriberName,
      groupNumber,
      relationship,
      priority,
      effectiveDate,
      terminationDate,
      copay,
      deductible,
    } = body

    if (!insurancePlanId || !subscriberId || !subscriberName) {
      return NextResponse.json(
        { error: 'Insurance plan, subscriber ID and subscriber name are required' },
        { status: 400 }
      )
    }

    const insurance = await prisma.patientInsurance.create({
      data: {
        patientId: params.id,
        insurancePlanId,
        subscriberId,
        subscriberName,
        groupNumber,
        relationship: relationship || 'Self',
        priority: priority || 1,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        copay,
        deductible,
      },
      include: {
        insurancePlan: {
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
        entity: 'PATIENT_INSURANCE',
        entityId: insurance.id,
        changes: {
          patientId: params.id,
          insurancePlan: insurance.insurancePlan.name,
          subscriberId,
        },
      },
    })

    return NextResponse.json(insurance, { status: 201 })
  } catch (error) {
    console.error('Error creating patient insurance:', error)
    return NextResponse.json({ error: 'Failed to create insurance' }, { status: 500 })
  }
}
