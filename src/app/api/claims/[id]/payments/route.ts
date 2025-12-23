import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const { paymentDate, amount, payerType, checkNumber, reference } = body

    // Validate required fields
    if (!paymentDate || !amount || !payerType) {
      return apiError('Payment date, amount, and payer type are required', 400)
    }

    // Validate claim exists
    const claim = await prisma.claim.findUnique({
      where: { id },
    })

    if (!claim) {
      return apiError('Claim not found', 404)
    }

    // Create the payment
    const payment = await prisma.claimPayment.create({
      data: {
        claimId: id,
        paymentDate: new Date(paymentDate),
        amount: parseFloat(amount),
        payerType,
        checkNumber: checkNumber || null,
        reference: reference || null,
      },
    })

    // Update claim paid amount
    const totalPayments = await prisma.claimPayment.aggregate({
      where: { claimId: id },
      _sum: { amount: true },
    })

    const totalPaid = Number(totalPayments._sum.amount) || 0
    const totalCharges = Number(claim.totalCharges) || 0
    const adjustmentAmount = Number(claim.adjustmentAmount) || 0
    const balance = totalCharges - totalPaid - adjustmentAmount

    // Determine new status based on payments
    let newStatus = claim.status
    if (balance <= 0) {
      newStatus = 'PAID'
    } else if (totalPaid > 0) {
      newStatus = 'PARTIAL'
    }

    await prisma.claim.update({
      where: { id },
      data: {
        paidAmount: totalPaid,
        status: newStatus,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'ClaimPayment',
      entityId: payment.id,
      patientId: claim.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(payment)
  } catch (error) {
    console.error('Failed to post payment:', error)
    return apiError('Failed to post payment', 500)
  }
}
