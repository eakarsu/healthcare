import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { QUALITY_MEASURES, PI_MEASURES, IA_MEASURES, getMeasuresForSpecialty } from '@/lib/quality-measures/definitions'

/**
 * GET /api/quality/measures - List available quality measures
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')
    const category = searchParams.get('category')

    // Filter measures by specialty and category
    let measures = specialty
      ? getMeasuresForSpecialty(specialty)
      : QUALITY_MEASURES

    if (category && category !== 'QUALITY') {
      if (category === 'PI') {
        return apiResponse({ measures: PI_MEASURES })
      } else if (category === 'IA') {
        return apiResponse({ measures: IA_MEASURES })
      }
    }

    return apiResponse({
      measures: measures.map((m) => ({
        measureId: m.measureId,
        measureTitle: m.measureTitle,
        description: m.description,
        category: m.category,
        domain: m.domain,
        highPriority: m.highPriority,
        measurePoints: m.measurePoints,
        benchmarks: {
          star3: m.benchmark3Star,
          star4: m.benchmark4Star,
          star5: m.benchmark5Star,
        },
        applicableSpecialties: m.applicableSpecialties,
      })),
      categories: [
        { id: 'QUALITY', name: 'Quality', count: QUALITY_MEASURES.length },
        { id: 'PI', name: 'Promoting Interoperability', count: PI_MEASURES.length },
        { id: 'IA', name: 'Improvement Activities', count: IA_MEASURES.length },
      ],
    })
  } catch (error) {
    console.error('Failed to list measures:', error)
    return apiError('Failed to list measures', 500)
  }
}

/**
 * POST /api/quality/measures - Record patient measure attestation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      measureId,
      patientId,
      performanceYear,
      inNumerator,
      isExcluded,
      measureValue,
      notes,
    } = body

    if (!measureId || !patientId) {
      return apiError('Measure ID and patient ID are required', 400)
    }

    const year = performanceYear || new Date().getFullYear()

    // Get or create quality measure
    let qualityMeasure = await prisma.qualityMeasure.findFirst({
      where: { measureId },
    })

    if (!qualityMeasure) {
      const measureDef = QUALITY_MEASURES.find((m) => m.measureId === measureId)
      if (!measureDef) {
        return apiError('Invalid measure ID', 400)
      }

      qualityMeasure = await prisma.qualityMeasure.create({
        data: {
          measureId: measureDef.measureId,
          measureTitle: measureDef.measureTitle,
          category: measureDef.category,
          domain: measureDef.domain,
          description: measureDef.description,
          numeratorDescription: measureDef.numeratorDescription,
          denominatorDescription: measureDef.denominatorDescription,
          highPriority: measureDef.highPriority,
          measurePoints: measureDef.measurePoints,
          benchmark3Star: measureDef.benchmark3Star,
          benchmark4Star: measureDef.benchmark4Star,
          benchmark5Star: measureDef.benchmark5Star,
        },
      })
    }

    // Get provider
    const provider = await prisma.provider.findFirst({
      where: { userId: session.user.id },
    })

    if (!provider) {
      return apiError('Provider not found', 404)
    }

    // Performance period dates
    const performanceStart = new Date(year, 0, 1) // Jan 1
    const performanceEnd = new Date(year, 11, 31) // Dec 31

    // Upsert patient quality measure
    const patientMeasure = await prisma.patientQualityMeasure.upsert({
      where: {
        measureId_patientId_performanceYear: {
          measureId: qualityMeasure.id,
          patientId,
          performanceYear: year,
        },
      },
      create: {
        measureId: qualityMeasure.id,
        patientId,
        providerId: provider.id,
        performanceYear: year,
        performanceStart,
        performanceEnd,
        inDenominator: true,
        inNumerator: inNumerator ?? false,
        isExcluded: isExcluded ?? false,
        measureValue,
        measureDate: new Date(),
        autoCalculated: false,
      },
      update: {
        inNumerator: inNumerator ?? undefined,
        isExcluded: isExcluded ?? undefined,
        measureValue,
        measureDate: new Date(),
        autoCalculated: false,
      },
    })

    return apiResponse({
      success: true,
      patientMeasure: {
        id: patientMeasure.id,
        measureId: qualityMeasure.measureId,
        patientId,
        performanceYear: year,
        inNumerator: patientMeasure.inNumerator,
        isExcluded: patientMeasure.isExcluded,
      },
    })
  } catch (error) {
    console.error('Failed to record measure:', error)
    return apiError('Failed to record measure', 500)
  }
}
