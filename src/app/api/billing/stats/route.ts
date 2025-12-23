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

    const practiceId = session.user.practiceId

    // Get all claims for the practice
    const claims = await prisma.claim.findMany({
      where: {
        provider: {
          practiceId,
        },
      },
      select: {
        status: true,
        totalCharges: true,
        paidAmount: true,
        adjustmentAmount: true,
        serviceDate: true,
      },
    })

    // Calculate balance for each claim and statistics
    const claimsWithBalance = claims.map(c => {
      const charges = Number(c.totalCharges) || 0
      const paid = Number(c.paidAmount) || 0
      const adjustment = Number(c.adjustmentAmount) || 0
      const balance = charges - paid - adjustment
      return { ...c, balance, charges, paid }
    })

    const totalCharges = claimsWithBalance.reduce((sum, c) => sum + c.charges, 0)
    const totalPayments = claimsWithBalance.reduce((sum, c) => sum + c.paid, 0)
    const totalAR = claimsWithBalance.reduce((sum, c) => sum + Math.max(0, c.balance), 0)

    const claimsPending = claims.filter(c =>
      ['SUBMITTED', 'ACKNOWLEDGED', 'PENDING'].includes(c.status)
    ).length

    const claimsDenied = claims.filter(c => c.status === 'DENIED').length
    const claimsSubmitted = claims.filter(c =>
      ['SUBMITTED', 'ACKNOWLEDGED', 'PENDING'].includes(c.status)
    ).length

    // Calculate average days in A/R
    const now = new Date()
    const claimsWithPositiveBalance = claimsWithBalance.filter(c => c.balance > 0)
    const totalDays = claimsWithPositiveBalance.reduce((sum, c) => {
      const days = Math.floor((now.getTime() - new Date(c.serviceDate).getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)
    const averageDaysAR = claimsWithPositiveBalance.length > 0
      ? Math.round(totalDays / claimsWithPositiveBalance.length)
      : 0

    // Calculate collection rate
    const collectionRate = totalCharges > 0
      ? Math.round((totalPayments / totalCharges) * 100)
      : 0

    return apiResponse({
      totalCharges,
      totalPayments,
      totalAR,
      claimsPending,
      claimsDenied,
      claimsSubmitted,
      averageDaysAR,
      collectionRate,
    })
  } catch (error) {
    console.error('Failed to fetch billing stats:', error)
    return apiError('Failed to fetch billing stats', 500)
  }
}
