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

    const location = await prisma.location.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
      include: {
        rooms: {
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!location) {
      return apiError('Location not found', 404)
    }

    return apiResponse({ data: location })
  } catch (error) {
    console.error('Failed to fetch location:', error)
    return apiError('Failed to fetch location', 500)
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
    const { name, address, city, state, zipCode, phone } = body

    // Verify the location belongs to this practice
    const existingLocation = await prisma.location.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!existingLocation) {
      return apiError('Location not found', 404)
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        city,
        state,
        zip: zipCode,
        phone: phone || null,
      },
      include: {
        rooms: {
          orderBy: { name: 'asc' },
        },
      },
    })

    return apiResponse({ data: updatedLocation })
  } catch (error) {
    console.error('Failed to update location:', error)
    return apiError('Failed to update location', 500)
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

    // Verify the location belongs to this practice
    const existingLocation = await prisma.location.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!existingLocation) {
      return apiError('Location not found', 404)
    }

    // Soft delete by deactivating
    await prisma.location.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Failed to delete location:', error)
    return apiError('Failed to delete location', 500)
  }
}
