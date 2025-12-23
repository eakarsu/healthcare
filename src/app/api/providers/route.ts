import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const providers = await prisma.provider.findMany({
      where: {
        practiceId: session.user.practiceId,
      },
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
      orderBy: {
        user: { lastName: 'asc' },
      },
    })

    return apiResponse({ data: providers })
  } catch (error) {
    console.error('Failed to fetch providers:', error)
    return apiError('Failed to fetch providers', 500)
  }
}
