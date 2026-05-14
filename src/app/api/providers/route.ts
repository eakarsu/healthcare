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
    const where = { practiceId: session.user.practiceId }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
          locations: {
            include: {
              location: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { user: { lastName: 'asc' } },
        take: limit,
        skip,
      }),
      prisma.provider.count({ where }),
    ])

    return apiResponse({
      data: providers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch providers:', error)
    return apiError('Failed to fetch providers', 500)
  }
}
