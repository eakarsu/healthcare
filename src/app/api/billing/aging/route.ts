import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const url = new URL(request.url)
    const bucket = url.searchParams.get('bucket')
    const payer = url.searchParams.get('payer')

    const practiceId = session.user.practiceId

    // Get all claims that aren't fully paid
    const claims = await prisma.claim.findMany({
      where: {
        status: {
          notIn: ['PAID', 'VOID'],
        },
        provider: {
          practiceId,
        },
        ...(payer && payer !== 'all' ? {
          insurancePlan: {
            payerName: { contains: payer, mode: 'insensitive' },
          },
        } : {}),
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            mrn: true,
          },
        },
        insurancePlan: {
          select: {
            name: true,
            payerName: true,
          },
        },
      },
    })

    const now = new Date()

    // Calculate balance and days old for each claim
    const claimsWithAge = claims.map(claim => {
      const totalCharges = Number(claim.totalCharges) || 0
      const paidAmount = Number(claim.paidAmount) || 0
      const adjustmentAmount = Number(claim.adjustmentAmount) || 0
      const balance = totalCharges - paidAmount - adjustmentAmount

      const daysOld = Math.floor(
        (now.getTime() - new Date(claim.serviceDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      return { ...claim, balance, daysOld }
    }).filter(claim => claim.balance > 0)

    // Group into aging buckets
    const buckets = [
      { range: '0-30', min: 0, max: 30 },
      { range: '31-60', min: 31, max: 60 },
      { range: '61-90', min: 61, max: 90 },
      { range: '91-120', min: 91, max: 120 },
      { range: '120+', min: 121, max: Infinity },
    ]

    const totalAR = claimsWithAge.reduce((sum, c) => sum + c.balance, 0)

    const agingBuckets = buckets.map(b => {
      const bucketClaims = claimsWithAge.filter(c => c.daysOld >= b.min && c.daysOld <= b.max)
      const amount = bucketClaims.reduce((sum, c) => sum + c.balance, 0)
      return {
        range: b.range,
        count: bucketClaims.length,
        amount,
        percentage: totalAR > 0 ? Math.round((amount / totalAR) * 100) : 0,
      }
    })

    // Filter claims by bucket if specified
    let filteredClaims = claimsWithAge
    if (bucket && bucket !== 'all') {
      const selectedBucket = buckets.find(b => b.range === bucket)
      if (selectedBucket) {
        filteredClaims = claimsWithAge.filter(
          c => c.daysOld >= selectedBucket.min && c.daysOld <= selectedBucket.max
        )
      }
    }

    // Sort by balance descending
    filteredClaims.sort((a, b) => b.balance - a.balance)

    return apiResponse({
      buckets: agingBuckets,
      totalAR,
      claims: filteredClaims.slice(0, 50).map(c => ({
        id: c.id,
        claimNumber: c.claimNumber,
        patient: c.patient,
        insurancePlan: c.insurancePlan,
        serviceDate: c.serviceDate,
        balance: c.balance,
        daysOld: c.daysOld,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch aging data:', error)
    return apiError('Failed to fetch aging data', 500)
  }
}
