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

    const provider = await prisma.provider.findFirst({
      where: {
        id,
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
    })

    if (!provider) {
      return apiError('Provider not found', 404)
    }

    return apiResponse({ data: provider })
  } catch (error) {
    console.error('Failed to fetch provider:', error)
    return apiError('Failed to fetch provider', 500)
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
    const { firstName, lastName, email, npi, specialty } = body

    // Verify the provider belongs to this practice
    const existingProvider = await prisma.provider.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
      include: { user: true },
    })

    if (!existingProvider) {
      return apiError('Provider not found', 404)
    }

    // Update user info
    await prisma.user.update({
      where: { id: existingProvider.userId },
      data: {
        firstName,
        lastName,
        ...(email && { email }),
      },
    })

    // Update provider info
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        npi,
        specialty,
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
      },
    })

    return apiResponse({ data: updatedProvider })
  } catch (error) {
    console.error('Failed to update provider:', error)
    return apiError('Failed to update provider', 500)
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

    // Verify the provider belongs to this practice
    const existingProvider = await prisma.provider.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!existingProvider) {
      return apiError('Provider not found', 404)
    }

    // Soft delete by deactivating the user (provider status is managed through user)
    await prisma.user.update({
      where: { id: existingProvider.userId },
      data: { isActive: false },
    })

    return apiResponse({ message: 'Provider deleted successfully' })
  } catch (error) {
    console.error('Failed to delete provider:', error)
    return apiError('Failed to delete provider', 500)
  }
}
