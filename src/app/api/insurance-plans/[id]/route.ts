import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    const plan = await prisma.insurancePlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { patientInsurances: true },
        },
      },
    })

    if (!plan) {
      return apiError('Insurance plan not found', 404)
    }

    return apiResponse(plan)
  } catch (error) {
    console.error('Failed to fetch insurance plan:', error)
    return apiError('Failed to fetch insurance plan', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const body = await request.json()

    const existingPlan = await prisma.insurancePlan.findUnique({
      where: { id },
    })

    if (!existingPlan) {
      return apiError('Insurance plan not found', 404)
    }

    const plan = await prisma.insurancePlan.update({
      where: { id },
      data: {
        payerId: body.payerId,
        payerName: body.payerName,
        name: body.name,
        planType: body.planType,
        phone: body.phone || null,
      },
    })

    return apiResponse(plan)
  } catch (error) {
    console.error('Failed to update insurance plan:', error)
    return apiError('Failed to update insurance plan', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    const existingPlan = await prisma.insurancePlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { patientInsurances: true },
        },
      },
    })

    if (!existingPlan) {
      return apiError('Insurance plan not found', 404)
    }

    if (existingPlan._count.patientInsurances > 0) {
      return apiError('Cannot delete insurance plan with enrolled patients', 400)
    }

    await prisma.insurancePlan.delete({
      where: { id },
    })

    return apiResponse({ message: 'Insurance plan deleted' })
  } catch (error) {
    console.error('Failed to delete insurance plan:', error)
    return apiError('Failed to delete insurance plan', 500)
  }
}
