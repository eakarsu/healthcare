import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import {
  getScreeningTemplate,
  getAvailableScreenings,
  scoreScreening,
  ScreeningType
} from '@/lib/mental-health'

// Get screening templates or patient screenings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as ScreeningType | null
    const patientId = searchParams.get('patientId')
    const encounterId = searchParams.get('encounterId')

    // Return available screening types
    if (!type && !patientId) {
      return apiResponse(getAvailableScreenings())
    }

    // Return screening template
    if (type && !patientId) {
      const template = getScreeningTemplate(type)
      if (!template) {
        return apiError('Screening type not found', 404)
      }
      return apiResponse(template)
    }

    // Return patient screenings
    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (encounterId) where.encounterId = encounterId
    if (type) where.type = type

    const screenings = await prisma.mentalHealthScreening.findMany({
      where,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        encounter: {
          select: { id: true, encounterNumber: true }
        }
      },
      orderBy: { administeredAt: 'desc' }
    })

    return apiResponse(screenings)
  } catch (error) {
    console.error('Failed to get screenings:', error)
    return apiError('Failed to get screenings', 500)
  }
}

// Submit a screening
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      patientId,
      encounterId,
      providerId,
      type,
      responses,
      providerNotes
    } = body

    if (!patientId || !type || !responses) {
      return apiError('Patient ID, screening type, and responses are required', 400)
    }

    // Get template and score
    const template = getScreeningTemplate(type)
    if (!template) {
      return apiError('Invalid screening type', 400)
    }

    const result = scoreScreening(template, responses)

    // Create screening record
    const screening = await prisma.mentalHealthScreening.create({
      data: {
        patientId,
        encounterId,
        providerId,
        type,
        responses: result.responses,
        totalScore: result.totalScore,
        interpretation: result.interpretation,
        riskLevel: result.severity,
        providerNotes,
        referralMade: false,
        administeredAt: new Date()
      }
    })

    // Return full result with recommendations
    return apiResponse({
      screening,
      result: {
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        severity: result.severity,
        interpretation: result.interpretation,
        recommendation: result.recommendation,
        criticalAlerts: result.criticalAlerts
      }
    }, 201)
  } catch (error) {
    console.error('Failed to submit screening:', error)
    return apiError('Failed to submit screening', 500)
  }
}
