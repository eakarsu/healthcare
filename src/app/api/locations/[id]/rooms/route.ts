import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id: locationId } = await params
    const body = await request.json()
    const { name, type = 'Exam' } = body

    if (!name) {
      return apiError('Room name is required', 400)
    }

    // Verify the location belongs to this practice
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        practiceId: session.user.practiceId,
      },
    })

    if (!location) {
      return apiError('Location not found', 404)
    }

    const room = await prisma.room.create({
      data: {
        locationId,
        name,
        type,
        isActive: true,
      },
    })

    return apiResponse({ data: room }, 201)
  } catch (error) {
    console.error('Failed to create room:', error)
    return apiError('Failed to create room', 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id: locationId } = await params

    // Verify the location belongs to this practice
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        practiceId: session.user.practiceId,
      },
    })

    if (!location) {
      return apiError('Location not found', 404)
    }

    const rooms = await prisma.room.findMany({
      where: { locationId },
      orderBy: { name: 'asc' },
    })

    return apiResponse({ data: rooms })
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return apiError('Failed to fetch rooms', 500)
  }
}
