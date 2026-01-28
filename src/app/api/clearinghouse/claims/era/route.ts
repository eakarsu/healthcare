import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

/**
 * ERA (Electronic Remittance Advice) Webhook
 * Receives 835 payment information from Change Healthcare
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, verify with secret)
    const signature = request.headers.get('x-change-healthcare-signature')
    const webhookSecret = process.env.CHANGE_HEALTHCARE_WEBHOOK_SECRET

    if (webhookSecret && !verifySignature(signature, webhookSecret)) {
      return apiError('Invalid webhook signature', 401)
    }

    const body = await request.json()

    // Process the ERA/835 data
    const {
      transactionId,
      claimNumber,
      payerId,
      payerName,
      checkNumber,
      checkDate,
      totalPaymentAmount,
      claimPayments,
    } = body

    // Find the original submission
    const submission = await prisma.claimSubmission.findFirst({
      where: {
        OR: [
          { transactionId },
          { claim: { claimNumber } },
        ],
      },
      include: {
        claim: true,
      },
    })

    if (!submission) {
      console.warn(`ERA received for unknown claim: ${claimNumber}`)
      // Still return success to prevent webhook retries
      return apiResponse({ received: true, processed: false, reason: 'Claim not found' })
    }

    // Update the submission with ERA data
    await prisma.claimSubmission.update({
      where: { id: submission.id },
      data: {
        clearinghouseStatus: 'PAID',
        era835Content: JSON.stringify(body),
      },
    })

    // Calculate payment details
    let totalPaid = 0
    let totalAllowed = 0
    let totalAdjustment = 0
    let denialCode: string | null = null
    let denialReason: string | null = null

    if (claimPayments && Array.isArray(claimPayments)) {
      for (const payment of claimPayments) {
        totalPaid += payment.paidAmount || 0
        totalAllowed += payment.allowedAmount || 0
        totalAdjustment += payment.adjustmentAmount || 0

        // Check for denials at line level
        if (payment.adjustmentReasonCode && payment.paidAmount === 0) {
          denialCode = denialCode || payment.adjustmentReasonCode
          denialReason = denialReason || payment.adjustmentReasonDescription
        }

        // Update claim lines if we have line-level detail
        if (payment.lineNumber) {
          await prisma.claimLine.updateMany({
            where: {
              claimId: submission.claimId,
              lineNumber: payment.lineNumber,
            },
            data: {
              paidAmount: payment.paidAmount,
              allowedAmount: payment.allowedAmount,
              adjustmentAmount: payment.adjustmentAmount,
              denialReason: payment.adjustmentReasonDescription,
              remarkCodes: payment.remarkCodes || [],
            },
          })
        }
      }
    } else {
      totalPaid = totalPaymentAmount || 0
    }

    // Determine claim status based on payment
    let claimStatus: 'PAID' | 'DENIED' | 'PARTIAL' = 'PAID'
    if (totalPaid === 0) {
      claimStatus = 'DENIED'
    } else if (totalPaid < Number(submission.claim.totalCharges) * 0.9) {
      // Less than 90% paid might indicate partial payment
      claimStatus = 'PARTIAL'
    }

    // Update the claim
    await prisma.claim.update({
      where: { id: submission.claimId },
      data: {
        status: claimStatus,
        paidAmount: totalPaid,
        allowedAmount: totalAllowed,
        adjustmentAmount: totalAdjustment,
        patientResponsibility: Number(submission.claim.totalCharges) - totalPaid - totalAdjustment,
        processedDate: new Date(),
        eraReceived: true,
        eraDate: new Date(),
        ...(claimStatus === 'DENIED' && {
          denialCode,
          denialReason,
        }),
      },
    })

    // Create payment record if paid
    if (totalPaid > 0) {
      await prisma.claimPayment.create({
        data: {
          claimId: submission.claimId,
          payerType: 'Insurance',
          amount: totalPaid,
          paymentDate: checkDate ? new Date(checkDate) : new Date(),
          checkNumber: checkNumber,
          reference: `ERA - ${payerName || 'Insurance'}`,
        },
      })
    }

    console.log(`ERA processed for claim ${submission.claim.claimNumber}: ${claimStatus}, paid: $${totalPaid}`)

    return apiResponse({
      received: true,
      processed: true,
      claimId: submission.claimId,
      claimNumber: submission.claim.claimNumber,
      status: claimStatus,
      paidAmount: totalPaid,
    })
  } catch (error) {
    console.error('Failed to process ERA:', error)
    // Return success to prevent webhook retries even on error
    return apiResponse({ received: true, processed: false, error: 'Processing error' })
  }
}

/**
 * Verify webhook signature
 */
function verifySignature(signature: string | null, secret: string): boolean {
  if (!signature) return false

  // In production, implement proper HMAC verification
  // For now, simple comparison (replace with crypto.timingSafeEqual)
  return signature === secret
}

/**
 * GET endpoint to manually fetch and process ERAs
 */
export async function GET(request: NextRequest) {
  try {
    // In a production system, this would poll the clearinghouse for ERAs
    // For now, return a list of recent ERA submissions

    const recentERAs = await prisma.claimSubmission.findMany({
      where: {
        era835Content: { not: null },
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
      include: {
        claim: {
          select: {
            claimNumber: true,
            status: true,
            paidAmount: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return apiResponse({
      count: recentERAs.length,
      eras: recentERAs.map((era) => ({
        transactionId: era.transactionId,
        claimNumber: era.claim.claimNumber,
        patient: `${era.claim.patient.firstName} ${era.claim.patient.lastName}`,
        status: era.claim.status,
        paidAmount: era.claim.paidAmount,
        receivedAt: era.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch ERAs:', error)
    return apiError('Failed to fetch ERAs', 500)
  }
}
