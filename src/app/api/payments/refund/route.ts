import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRefund, dollarsToCents, centsToDollars } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, amount, reason } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get the payment record
    const payment = await prisma.patientPayment.findUnique({
      where: { id: paymentId },
      include: { patient: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'This payment was not processed through Stripe' },
        { status: 400 }
      )
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { error: 'This payment has already been refunded' },
        { status: 400 }
      )
    }

    // Calculate refund amount
    const refundAmountCents = amount
      ? dollarsToCents(parseFloat(amount))
      : undefined // Full refund if no amount specified

    // Create refund in Stripe
    const refund = await createRefund(
      payment.stripePaymentIntentId,
      refundAmountCents,
      reason as 'duplicate' | 'fraudulent' | 'requested_by_customer' | undefined
    )

    const refundedAmount = centsToDollars(refund.amount)

    // Update payment record
    await prisma.patientPayment.update({
      where: { id: paymentId },
      data: {
        status: refundAmountCents ? 'partially_refunded' : 'refunded',
        stripeRefundId: refund.id,
        notes: payment.notes
          ? `${payment.notes} | Refunded: $${refundedAmount}`
          : `Refunded: $${refundedAmount}`,
      },
    })

    // Update patient balance if exists
    const balance = await prisma.patientBalance.findUnique({
      where: { patientId: payment.patientId },
    })

    if (balance) {
      await prisma.patientBalance.update({
        where: { patientId: payment.patientId },
        data: {
          patientPaid: { decrement: refundedAmount },
          balance: { increment: refundedAmount },
        },
      })
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundedAmount,
        status: refund.status,
        reason: refund.reason,
      },
    })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}
