import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// Get single screening
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

    const screening = await prisma.mentalHealthScreening.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        encounter: {
          select: { id: true, encounterNumber: true, encounterDate: true }
        }
      }
    })

    if (!screening) {
      return apiError('Screening not found', 404)
    }

    return apiResponse(screening)
  } catch (error) {
    console.error('Failed to get screening:', error)
    return apiError('Failed to get screening', 500)
  }
}

// Update screening (add notes, referral info)
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
    const {
      providerNotes,
      followUpPlan,
      referralMade,
      referralTo
    } = body

    const screening = await prisma.mentalHealthScreening.findUnique({
      where: { id }
    })

    if (!screening) {
      return apiError('Screening not found', 404)
    }

    const updated = await prisma.mentalHealthScreening.update({
      where: { id },
      data: {
        ...(providerNotes !== undefined && { providerNotes }),
        ...(followUpPlan !== undefined && { followUpPlan }),
        ...(referralMade !== undefined && { referralMade }),
        ...(referralTo !== undefined && { referralTo })
      }
    })

    return apiResponse(updated)
  } catch (error) {
    console.error('Failed to update screening:', error)
    return apiError('Failed to update screening', 500)
  }
}

// Delete screening
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

    await prisma.mentalHealthScreening.delete({
      where: { id }
    })

    return apiResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete screening:', error)
    return apiError('Failed to delete screening', 500)
  }
}
