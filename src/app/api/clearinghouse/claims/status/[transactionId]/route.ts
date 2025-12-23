import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { checkClaimStatus, isConfigured } from '@/lib/change-healthcare'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { transactionId } = await params

    // Find the submission record
    const submission = await prisma.claimSubmission.findFirst({
      where: { transactionId },
      include: {
        claim: {
          include: {
            patient: true,
            insurancePlan: true,
          },
        },
      },
    })

    if (!submission) {
      return apiError('Submission not found', 404)
    }

    // Check status with Change Healthcare
    const status = await checkClaimStatus(transactionId)

    // Update the submission record if status changed
    if (status.status !== submission.clearinghouseStatus) {
      await prisma.claimSubmission.update({
        where: { id: submission.id },
        data: {
          clearinghouseStatus: status.status,
          responseMessage: status.message,
        },
      })

      // Update claim status based on clearinghouse response
      const claimStatus = mapClearinghouseStatusToClaimStatus(status.status)
      if (claimStatus && submission.claim.status !== claimStatus) {
        await prisma.claim.update({
          where: { id: submission.claimId },
          data: {
            status: claimStatus,
            ...(claimStatus === 'DENIED' && {
              denialReason: status.message,
            }),
          },
        })
      }
    }

    return apiResponse({
      transactionId,
      status: status.status,
      message: status.message,
      claim: {
        id: submission.claim.id,
        claimNumber: submission.claim.claimNumber,
        status: submission.claim.status,
        patient: {
          id: submission.claim.patient.id,
          name: `${submission.claim.patient.firstName} ${submission.claim.patient.lastName}`,
        },
        insurancePlan: submission.claim.insurancePlan.name,
        totalCharges: submission.claim.totalCharges,
      },
      submittedAt: submission.submittedAt,
      isRealData: isConfigured(),
    })
  } catch (error) {
    console.error('Failed to check claim status:', error)
    return apiError('Failed to check claim status', 500)
  }
}

/**
 * Map clearinghouse status to internal claim status
 */
function mapClearinghouseStatusToClaimStatus(
  clearinghouseStatus: string
): 'SUBMITTED' | 'ACCEPTED' | 'DENIED' | 'PAID' | null {
  const statusMap: Record<string, 'SUBMITTED' | 'ACCEPTED' | 'DENIED' | 'PAID'> = {
    ACKNOWLEDGED: 'ACCEPTED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'DENIED',
    PAID: 'PAID',
  }
  return statusMap[clearinghouseStatus] || null
}
