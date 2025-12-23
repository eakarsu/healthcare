import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { calculateMeasure } from '@/lib/quality-measures/calculator'
import { getMeasureById } from '@/lib/quality-measures/definitions'

/**
 * GET /api/quality/patients - Get patients with quality measure gaps
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const measureId = searchParams.get('measureId')
    const providerId = searchParams.get('providerId')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!measureId) {
      return apiError('Measure ID is required', 400)
    }

    // Get provider
    let provider = null
    if (providerId) {
      provider = await prisma.provider.findUnique({ where: { id: providerId } })
    } else {
      provider = await prisma.provider.findFirst({
        where: { userId: session.user.id },
      })
    }

    if (!provider) {
      return apiError('Provider not found', 404)
    }

    // Get measure definition
    const measureDef = getMeasureById(measureId)
    if (!measureDef) {
      return apiError('Measure not found', 404)
    }

    // Calculate measure to get gap patients
    const measureResult = await calculateMeasure(measureId, provider.id, year)

    // Get patient details for gap patients
    const gapPatientIds = measureResult.gapPatients.slice(
      (page - 1) * limit,
      page * limit
    )

    const patients = await prisma.patient.findMany({
      where: { id: { in: gapPatientIds } },
      include: {
        appointments: {
          where: {
            scheduledStart: { gte: new Date() },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          orderBy: { scheduledStart: 'asc' },
          take: 1,
        },
        encounters: {
          orderBy: { encounterDate: 'desc' },
          take: 1,
        },
      },
    })

    const patientGaps = patients.map((patient) => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
      phone: patient.phone,
      email: patient.email,
      lastVisit: patient.encounters[0]?.encounterDate,
      nextAppointment: patient.appointments[0]?.scheduledStart,
      measureGap: {
        measureId,
        measureTitle: measureDef.measureTitle,
        recommendation: getRecommendation(measureId),
      },
    }))

    return apiResponse({
      measure: {
        measureId,
        measureTitle: measureDef.measureTitle,
        performanceRate: measureResult.performanceRate,
        totalGaps: measureResult.gapPatients.length,
      },
      patients: patientGaps,
      pagination: {
        page,
        limit,
        total: measureResult.gapPatients.length,
        totalPages: Math.ceil(measureResult.gapPatients.length / limit),
      },
    })
  } catch (error) {
    console.error('Failed to get gap patients:', error)
    return apiError('Failed to get gap patients', 500)
  }
}

/**
 * Get recommendation for closing a measure gap
 */
function getRecommendation(measureId: string): string {
  const recommendations: Record<string, string> = {
    CMS122v11: 'Order HbA1c lab test',
    CMS165v11: 'Measure blood pressure',
    CMS130v11: 'Order colonoscopy or FIT/FOBT',
    CMS125v11: 'Order mammogram',
    CMS131v11: 'Refer for diabetic eye exam',
    CMS127v11: 'Administer pneumococcal vaccine',
    CMS138v11: 'Document tobacco screening',
    CMS347v5: 'Prescribe statin therapy',
    CMS156v11: 'Review and discontinue high-risk medications',
    CMS50v11: 'Follow up on specialist referral',
  }
  return recommendations[measureId] || 'Review patient chart for gap closure opportunity'
}
