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

    const service = await prisma.service.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!service) {
      return apiError('Service not found', 404)
    }

    // Return mapped response
    return apiResponse({
      data: {
        id: service.id,
        cptCode: service.code,
        name: service.name,
        description: service.description,
        category: service.category,
        defaultPrice: 0,
        duration: service.duration,
        isActive: service.isActive,
      }
    })
  } catch (error) {
    console.error('Failed to fetch service:', error)
    return apiError('Failed to fetch service', 500)
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
    const { cptCode, name, description, category, defaultPrice, duration } = body

    // Verify the service belongs to this practice
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!existingService) {
      return apiError('Service not found', 404)
    }

    // Check for duplicate CPT code (excluding current service)
    if (cptCode && cptCode !== existingService.code) {
      const duplicateCode = await prisma.service.findFirst({
        where: {
          practiceId: session.user.practiceId,
          code: cptCode,
          NOT: { id },
        },
      })

      if (duplicateCode) {
        return apiError('A service with this CPT code already exists', 400)
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        code: cptCode || existingService.code,
        name,
        description: description || null,
        category,
        duration: duration || 30,
      },
    })

    // Return mapped response
    return apiResponse({
      data: {
        id: updatedService.id,
        cptCode: updatedService.code,
        name: updatedService.name,
        description: updatedService.description,
        category: updatedService.category,
        defaultPrice: 0,
        duration: updatedService.duration,
        isActive: updatedService.isActive,
      }
    })
  } catch (error) {
    console.error('Failed to update service:', error)
    return apiError('Failed to update service', 500)
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

    // Verify the service belongs to this practice
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        practiceId: session.user.practiceId,
      },
    })

    if (!existingService) {
      return apiError('Service not found', 404)
    }

    // Soft delete by deactivating
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Failed to delete service:', error)
    return apiError('Failed to delete service', 500)
  }
}
