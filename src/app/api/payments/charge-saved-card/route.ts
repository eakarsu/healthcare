import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chargeCustomer, dollarsToCents } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { patientId, paymentMethodId, amount, description } = await request.json()

    if (!patientId || !paymentMethodId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, paymentMethodId, amount' },
        { status: 400 }
      )
    }

    if (amount <= 0 || amount > 999999.99) {
      return NextResponse.json(
        { error: 'Amount must be between $0.01 and $999,999.99' },
        { status: 400 }
      )
    }

    // Get patient with their Stripe customer ID
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        practiceId: session.user.practiceId,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (!patient.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Patient does not have a Stripe customer ID' },
        { status: 400 }
      )
    }

    // Charge the saved card
    const amountInCents = dollarsToCents(amount)
    const paymentIntent = await chargeCustomer(
      patient.stripeCustomerId,
      paymentMethodId,
      amountInCents,
      description || `Payment for ${patient.firstName} ${patient.lastName}`,
      {
        patientId: patient.id,
        practiceId: session.user.practiceId,
      }
    )

    // Create a payment record in the database
    const payment = await prisma.patientPayment.create({
      data: {
        patientId: patient.id,
        amount: amount,
        method: 'CREDIT_CARD',
        status: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        notes: description || 'Card payment',
        date: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    })
  } catch (error: unknown) {
    console.error('Failed to charge saved card:', error)

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string; message?: string; code?: string }
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json(
          { error: stripeError.message || 'Card was declined' },
          { status: 400 }
        )
      }
    }

    const message = error instanceof Error ? error.message : 'Failed to process payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
