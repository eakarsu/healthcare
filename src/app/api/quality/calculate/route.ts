import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { calculateAllMeasures, calculateMeasure } from '@/lib/quality-measures/calculator'
import { QUALITY_MEASURES } from '@/lib/quality-measures/definitions'

/**
 * POST /api/quality/calculate - Trigger quality measure calculation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { providerId, measureId, year } = body
    const performanceYear = year || new Date().getFullYear()
    const { ipAddress, userAgent } = extractRequestInfo(request)

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

    let results

    if (measureId) {
      // Calculate specific measure
      const result = await calculateMeasure(measureId, provider.id, performanceYear)
      results = [result]

      // Store patient quality measure records
      await storePatientMeasures(measureId, result, provider.id, performanceYear)
    } else {
      // Calculate all measures
      results = await calculateAllMeasures(provider.id, performanceYear)

      // Store all patient measures
      for (const result of results) {
        await storePatientMeasures(result.measureId, result, provider.id, performanceYear)
      }
    }

    // Log the calculation
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'QualityMeasure',
      entityId: provider.id,
      changes: {
        action: 'calculated',
        measureId: measureId || 'all',
        performanceYear,
        measureCount: results.length,
      },
      ipAddress,
      userAgent,
    })

    return apiResponse({
      success: true,
      provider: provider.id,
      performanceYear,
      calculatedAt: new Date().toISOString(),
      results: results.map((r) => ({
        measureId: r.measureId,
        measureTitle: r.measureTitle,
        numerator: r.numerator,
        denominator: r.denominator,
        performanceRate: r.performanceRate,
        starRating: r.starRating,
        gapCount: r.gapPatients.length,
      })),
    })
  } catch (error) {
    console.error('Failed to calculate quality measures:', error)
    return apiError('Failed to calculate quality measures', 500)
  }
}

/**
 * Store patient quality measure records
 */
async function storePatientMeasures(
  measureId: string,
  result: {
    numerator: number
    denominator: number
    gapPatients: string[]
    performanceRate: number
  },
  providerId: string,
  performanceYear: number
) {
  const measure = QUALITY_MEASURES.find((m) => m.measureId === measureId)
  if (!measure) return

  // Get or create the quality measure record
  let qualityMeasure = await prisma.qualityMeasure.findFirst({
    where: { measureId },
  })

  if (!qualityMeasure) {
    qualityMeasure = await prisma.qualityMeasure.create({
      data: {
        measureId: measure.measureId,
        measureTitle: measure.measureTitle,
        category: measure.category,
        domain: measure.domain,
        description: measure.description,
        numeratorDescription: measure.numeratorDescription,
        denominatorDescription: measure.denominatorDescription,
        highPriority: measure.highPriority,
        measurePoints: measure.measurePoints,
        benchmark3Star: measure.benchmark3Star,
        benchmark4Star: measure.benchmark4Star,
        benchmark5Star: measure.benchmark5Star,
      },
    })
  }

  // Update patient measures for gap patients (not in numerator)
  for (const patientId of result.gapPatients) {
    await prisma.patientQualityMeasure.upsert({
      where: {
        measureId_patientId_performanceYear: {
          measureId: qualityMeasure.id,
          patientId,
          performanceYear,
        },
      },
      create: {
        measureId: qualityMeasure.id,
        patientId,
        providerId,
        performanceYear,
        inDenominator: true,
        inNumerator: false,
        autoCalculated: true,
        measureDate: new Date(),
      },
      update: {
        inDenominator: true,
        inNumerator: false,
        autoCalculated: true,
        measureDate: new Date(),
      },
    })
  }
}
