import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createSetupIntent,
  getOrCreateCustomer,
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
    const { patientId } = body

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
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

    // Create setup intent
    const setupIntent = await createSetupIntent(stripeCustomerId)

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    })
  } catch (error) {
    console.error('Create setup intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
