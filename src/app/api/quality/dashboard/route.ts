import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { calculateAllMeasures } from '@/lib/quality-measures/calculator'
import { calculateMIPSScore, getIAPoints } from '@/lib/quality-measures/mips-scoring'
import { QUALITY_MEASURES, PI_MEASURES, IA_MEASURES } from '@/lib/quality-measures/definitions'

/**
 * GET /api/quality/dashboard - Get quality measures dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get provider
    let provider = null
    if (providerId) {
      provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: { user: true },
      })
    } else {
      // Get current user's provider profile
      provider = await prisma.provider.findFirst({
        where: { userId: session.user.id },
        include: { user: true },
      })
    }

    if (!provider) {
      return apiError('Provider not found', 404)
    }

    // Calculate quality measures
    const qualityMeasures = await calculateAllMeasures(provider.id, year)

    // Get PI attestations (from stored records or defaults)
    const piAttestations = PI_MEASURES.map((m) => ({
      measureId: m.measureId,
      measureTitle: m.measureTitle,
      attested: false, // Would come from attestation records
      points: m.basePoints,
    }))

    // Get IA attestations
    const iaAttestations = IA_MEASURES.map((m) => ({
      measureId: m.measureId,
      measureTitle: m.measureTitle,
      weight: m.weight as 'HIGH' | 'MEDIUM',
      attested: false, // Would come from attestation records
      points: getIAPoints(m.weight as 'HIGH' | 'MEDIUM'),
    }))

    // Calculate MIPS score
    const mipsScore = calculateMIPSScore(
      qualityMeasures,
      piAttestations,
      iaAttestations,
      0, // Cost score calculated by CMS
      year
    )

    // Get trend data (last 4 quarters)
    const trendData = await getQualityTrend(provider.id, year)

    // Get top gap opportunities
    const gapOpportunities = getTopGapOpportunities(qualityMeasures)

    return apiResponse({
      provider: {
        id: provider.id,
        name: `${provider.user.firstName} ${provider.user.lastName}`,
        specialty: provider.specialty,
        npi: provider.npi,
      },
      performanceYear: year,
      mipsScore: {
        final: mipsScore.finalScore,
        quality: mipsScore.qualityScore,
        pi: mipsScore.piScore,
        ia: mipsScore.iaScore,
        cost: mipsScore.costScore,
        paymentAdjustment: mipsScore.paymentAdjustment,
      },
      qualityMeasures: qualityMeasures.map((m) => ({
        measureId: m.measureId,
        measureTitle: m.measureTitle,
        numerator: m.numerator,
        denominator: m.denominator,
        exclusions: m.exclusions,
        performanceRate: m.performanceRate,
        starRating: m.starRating,
        benchmarks: {
          star3: m.benchmark3Star,
          star4: m.benchmark4Star,
          star5: m.benchmark5Star,
        },
        gapCount: m.gapPatients.length,
      })),
      piMeasures: piAttestations,
      iaMeasures: iaAttestations,
      trendData,
      gapOpportunities,
      availableMeasures: QUALITY_MEASURES.length,
      reportedMeasures: qualityMeasures.filter((m) => m.denominator > 0).length,
    })
  } catch (error) {
    console.error('Failed to get quality dashboard:', error)
    return apiError('Failed to get quality dashboard', 500)
  }
}

/**
 * Get quality measure trend data
 */
async function getQualityTrend(
  providerId: string,
  year: number
): Promise<{ quarter: string; score: number }[]> {
  // In production, this would query historical data
  // For now, return mock trend
  return [
    { quarter: `Q1 ${year}`, score: 72 },
    { quarter: `Q2 ${year}`, score: 75 },
    { quarter: `Q3 ${year}`, score: 78 },
    { quarter: `Q4 ${year}`, score: 80 },
  ]
}

/**
 * Get top gap opportunities
 */
function getTopGapOpportunities(
  measures: Array<{ measureId: string; measureTitle: string; gapPatients: string[]; performanceRate: number }>
): Array<{ measureId: string; measureTitle: string; gapCount: number; impact: string }> {
  return measures
    .filter((m) => m.gapPatients.length > 0)
    .sort((a, b) => b.gapPatients.length - a.gapPatients.length)
    .slice(0, 5)
    .map((m) => ({
      measureId: m.measureId,
      measureTitle: m.measureTitle,
      gapCount: m.gapPatients.length,
      impact: m.performanceRate < 50 ? 'High' : m.performanceRate < 70 ? 'Medium' : 'Low',
    }))
}
