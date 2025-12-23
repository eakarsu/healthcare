import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createPaymentIntent,
  getOrCreateCustomer,
  dollarsToCents,
  isStripeConfigured,
} from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { patientId, amount, description, encounterId, claimId } = body

    // Validate required fields
    if (!patientId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Patient ID and valid amount are required' },
        { status: 400 }
      )
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        stripeCustomerId: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let stripeCustomerId = patient.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await getOrCreateCustomer(
        patient.email || `patient-${patient.id}@practiceflux.com`,
        `${patient.firstName} ${patient.lastName}`,
        patient.phone || undefined,
        patient.id
      )

      stripeCustomerId = customer.id

      // Save Stripe customer ID to patient
      await prisma.patient.update({
        where: { id: patientId },
        data: { stripeCustomerId },
      })
    }

    // Create payment intent
    const amountInCents = dollarsToCents(parseFloat(amount))

    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      customerId: stripeCustomerId,
      description: description || 'Patient Payment',
      metadata: {
        patientId,
        encounterId: encounterId || '',
        claimId: claimId || '',
        practiceId: session.user.practiceId,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
