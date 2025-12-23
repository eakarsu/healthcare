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
    const category = url.searchParams.get('category')

    const where: Record<string, unknown> = {
      practiceId: session.user.practiceId,
    }

    if (category) {
      where.category = category
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
        take: limit,
        skip,
      }),
      prisma.service.count({ where }),
    ])

    // Map 'code' to 'cptCode' for frontend compatibility
    const mappedServices = services.map((s) => ({
      id: s.id,
      cptCode: s.code,
      name: s.name,
      description: s.description,
      category: s.category,
      defaultPrice: 0, // Not stored in DB, calculated from fee schedule
      duration: s.duration,
      isActive: s.isActive,
    }))

    return apiResponse({
      data: mappedServices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return apiError('Failed to fetch services', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { cptCode, name, description, category, duration } = body

    if (!cptCode || !name) {
      return apiError('CPT code and name are required', 400)
    }

    // Check for duplicate CPT code
    const existing = await prisma.service.findFirst({
      where: {
        practiceId: session.user.practiceId,
        code: cptCode,
      },
    })

    if (existing) {
      return apiError('A service with this CPT code already exists', 400)
    }

    const service = await prisma.service.create({
      data: {
        practiceId: session.user.practiceId,
        code: cptCode,
        name,
        description: description || null,
        category: category || 'E/M',
        duration: duration || 30,
        isActive: true,
      },
    })

    // Return mapped response
    return apiResponse({
      id: service.id,
      cptCode: service.code,
      name: service.name,
      description: service.description,
      category: service.category,
      defaultPrice: 0,
      duration: service.duration,
      isActive: service.isActive,
    }, 201)
  } catch (error) {
    console.error('Failed to create service:', error)
    return apiError('Failed to create service', 500)
  }
}
