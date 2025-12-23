import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent, centsToDollars } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`)

  const patientId = paymentIntent.metadata?.patientId

  if (!patientId) {
    console.log('No patient ID in payment metadata, skipping record creation')
    return
  }

  // Check if payment record already exists (created by confirm endpoint)
  const existingPayment = await prisma.patientPayment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (existingPayment) {
    // Update status if needed
    if (existingPayment.status !== 'completed') {
      await prisma.patientPayment.update({
        where: { id: existingPayment.id },
        data: { status: 'completed' },
      })
    }
    return
  }

  // Create payment record if it doesn't exist
  await prisma.patientPayment.create({
    data: {
      patientId,
      amount: centsToDollars(paymentIntent.amount),
      method: 'CREDIT_CARD',
      reference: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'completed',
      notes: paymentIntent.description || 'Payment via Stripe',
    },
  })

  // Update patient balance
  const balance = await prisma.patientBalance.findUnique({
    where: { patientId },
  })

  if (balance) {
    const amountPaid = centsToDollars(paymentIntent.amount)
    await prisma.patientBalance.update({
      where: { patientId },
      data: {
        patientPaid: { increment: amountPaid },
        balance: { decrement: amountPaid },
      },
    })
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`)

  const patientId = paymentIntent.metadata?.patientId

  if (!patientId) return

  // Update payment status if record exists
  await prisma.patientPayment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: 'failed' },
  })
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`)

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  // Find and update the payment record
  const payment = await prisma.patientPayment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!payment) return

  const refundedAmount = centsToDollars(charge.amount_refunded)

  // Update payment status
  await prisma.patientPayment.update({
    where: { id: payment.id },
    data: {
      status: charge.refunded ? 'refunded' : 'partially_refunded',
      notes: payment.notes
        ? `${payment.notes} | Refunded via webhook: $${refundedAmount}`
        : `Refunded: $${refundedAmount}`,
    },
  })

  // Update patient balance
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
}

/**
 * Handle new customer created
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`Customer created: ${customer.id}`)

  const patientId = customer.metadata?.patientId

  if (patientId) {
    // Link customer to patient
    await prisma.patient.update({
      where: { id: patientId },
      data: { stripeCustomerId: customer.id },
    })
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log(`Customer updated: ${customer.id}`)
  // Add any update logic if needed
}

/**
 * Handle successful setup intent (card saved)
 */
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log(`Setup intent succeeded: ${setupIntent.id}`)
  // Card has been saved to the customer
  // You can trigger notifications or other actions here
}
