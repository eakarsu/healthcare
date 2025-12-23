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

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where: { practiceId: session.user.practiceId },
        include: {
          rooms: {
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip,
      }),
      prisma.location.count({ where: { practiceId: session.user.practiceId } }),
    ])

    return apiResponse({
      data: locations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return apiError('Failed to fetch locations', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()

    const location = await prisma.location.create({
      data: {
        practiceId: session.user.practiceId,
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        phone: body.phone || null,
        isActive: true,
      },
      include: {
        rooms: true,
      },
    })

    return apiResponse(location, 201)
  } catch (error) {
    console.error('Failed to create location:', error)
    return apiError('Failed to create location', 500)
  }
}
