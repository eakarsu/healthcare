import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentIntent, centsToDollars } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentIntentId, patientId, notes } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await getPaymentIntent(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not successful. Status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

    // Get patient ID from metadata or request body
    const actualPatientId = patientId || paymentIntent.metadata.patientId

    if (!actualPatientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Create patient payment record
    const payment = await prisma.patientPayment.create({
      data: {
        patientId: actualPatientId,
        amount: centsToDollars(paymentIntent.amount),
        method: 'CREDIT_CARD',
        reference: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        status: 'completed',
        notes: notes || `Payment via Stripe - ${paymentIntent.description || 'Patient Payment'}`,
      },
    })

    // Update patient balance if exists
    const balance = await prisma.patientBalance.findUnique({
      where: { patientId: actualPatientId },
    })

    if (balance) {
      const amountPaid = centsToDollars(paymentIntent.amount)
      await prisma.patientBalance.update({
        where: { patientId: actualPatientId },
        data: {
          patientPaid: { increment: amountPaid },
          balance: { decrement: amountPaid },
        },
      })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        date: payment.date,
        status: payment.status,
      },
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: centsToDollars(paymentIntent.amount),
      },
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
