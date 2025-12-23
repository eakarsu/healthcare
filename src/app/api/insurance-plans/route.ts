import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')

    const where: Record<string, unknown> = {
      practiceId: session.user.practiceId,
    }

    if (search) {
      where.OR = [
        { payerName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { payerId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [plans, total] = await Promise.all([
      prisma.insurancePlan.findMany({
        where,
        include: {
          _count: {
            select: { patientInsurances: true },
          },
        },
        orderBy: [{ payerName: 'asc' }, { name: 'asc' }],
        take: limit,
        skip,
      }),
      prisma.insurancePlan.count({ where }),
    ])

    return apiResponse({
      data: plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch insurance plans:', error)
    return apiError('Failed to fetch insurance plans', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()

    const plan = await prisma.insurancePlan.create({
      data: {
        practiceId: session.user.practiceId,
        payerId: body.payerId,
        payerName: body.payerName,
        name: body.name,
        planType: body.planType || 'PPO',
        phone: body.phone || null,
        isActive: true,
      },
    })

    return apiResponse(plan, 201)
  } catch (error) {
    console.error('Failed to create insurance plan:', error)
    return apiError('Failed to create insurance plan', 500)
  }
}
