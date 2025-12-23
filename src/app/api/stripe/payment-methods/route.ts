import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  listPaymentMethods,
  detachPaymentMethod,
  setDefaultPaymentMethod,
  isStripeConfigured,
} from '@/lib/stripe'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { stripeCustomerId: true },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (!patient.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] })
    }

    // Get payment methods from Stripe
    const paymentMethods = await listPaymentMethods(patient.stripeCustomerId)

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: false, // You can track this in your DB if needed
      })),
    })
  } catch (error) {
    console.error('List payment methods error:', error)
    return NextResponse.json(
      { error: 'Failed to list payment methods' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethodId } = body

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Detach payment method from Stripe
    await detachPaymentMethod(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientId, paymentMethodId } = body

    if (!patientId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Patient ID and payment method ID are required' },
        { status: 400 }
      )
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { stripeCustomerId: true },
    })

    if (!patient || !patient.stripeCustomerId) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Set as default payment method
    await setDefaultPaymentMethod(patient.stripeCustomerId, paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set default payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    )
  }
}
