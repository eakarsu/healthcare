import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { generateClinicalJustification, generateAppealLetter } from '@/lib/prior-auth'

// Get single prior authorization
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

    const auth = await prisma.priorAuthorization.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            dateOfBirth: true
          }
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        insurance: {
          include: {
            insurancePlan: true
          }
        },
        encounter: {
          select: { id: true, encounterNumber: true }
        }
      }
    })

    if (!auth) {
      return apiError('Prior authorization not found', 404)
    }

    return apiResponse(auth)
  } catch (error) {
    console.error('Failed to get prior authorization:', error)
    return apiError('Failed to get prior authorization', 500)
  }
}

// Update prior authorization
export async function PATCH(
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

    const auth = await prisma.priorAuthorization.findUnique({
      where: { id }
    })

    if (!auth) {
      return apiError('Prior authorization not found', 404)
    }

    const updatedAuth = await prisma.priorAuthorization.update({
      where: { id },
      data: {
        ...body,
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : undefined,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
        appealDeadline: body.appealDeadline ? new Date(body.appealDeadline) : undefined
      }
    })

    return apiResponse(updatedAuth)
  } catch (error) {
    console.error('Failed to update prior authorization:', error)
    return apiError('Failed to update prior authorization', 500)
  }
}

// Delete prior authorization
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

    await prisma.priorAuthorization.delete({
      where: { id }
    })

    return apiResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete prior authorization:', error)
    return apiError('Failed to delete prior authorization', 500)
  }
}
