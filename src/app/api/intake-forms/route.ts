import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// Get intake forms for practice
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const practiceId = searchParams.get('practiceId')
    const type = searchParams.get('type')

    const forms = await prisma.intakeForm.findMany({
      where: {
        ...(practiceId && { practiceId }),
        ...(type && { type: type as 'DEMOGRAPHICS' | 'MEDICAL_HISTORY' | 'MEDICATIONS' | 'ALLERGIES' | 'FAMILY_HISTORY' | 'SOCIAL_HISTORY' | 'REVIEW_OF_SYSTEMS' | 'CONSENT' | 'INSURANCE' | 'CUSTOM' }),
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    return apiResponse(forms)
  } catch (error) {
    console.error('Failed to get intake forms:', error)
    return apiError('Failed to get intake forms', 500)
  }
}

// Create new intake form
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      practiceId,
      name,
      type,
      description,
      fields,
      isRequired,
      requiresSignature,
      expirationDays
    } = body

    if (!practiceId || !name || !type || !fields) {
      return apiError('Missing required fields', 400)
    }

    const form = await prisma.intakeForm.create({
      data: {
        practiceId,
        name,
        type,
        description,
        fields,
        isRequired: isRequired || false,
        requiresSignature: requiresSignature || false,
        expirationDays,
        isActive: true
      }
    })

    return apiResponse(form, 201)
  } catch (error) {
    console.error('Failed to create intake form:', error)
    return apiError('Failed to create intake form', 500)
  }
}
