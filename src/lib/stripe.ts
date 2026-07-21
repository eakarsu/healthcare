import Stripe from 'stripe'

let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('Stripe is not configured')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      // @ts-expect-error - Stripe type may be stricter than actual API version support
      apiVersion: '2024-12-18.acacia',
    })
  }
  return stripeClient
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// ============ CUSTOMER MANAGEMENT ============

/**
 * Create a new Stripe customer
 */
export async function createCustomer(params: {
  email: string
  name: string
  phone?: string
  metadata?: Record<string, string>
}) {
  return getStripe().customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    metadata: params.metadata,
  })
}

/**
 * Get existing customer or create a new one
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  phone?: string,
  patientId?: string
): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await getStripe().customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return getStripe().customers.create({
    email,
    name,
    phone,
    metadata: patientId ? { patientId } : undefined,
  })
}

/**
 * Update customer information
 */
export async function updateCustomer(
  customerId: string,
  params: {
    email?: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
  }
) {
  return getStripe().customers.update(customerId, params)
}

/**
 * Retrieve customer by ID
 */
export async function getCustomer(customerId: string) {
  return getStripe().customers.retrieve(customerId)
}

// ============ PAYMENT INTENTS ============

/**
 * Create a payment intent for patient payment
 */
export async function createPaymentIntent(params: {
  amount: number // Amount in cents
  customerId?: string
  description?: string
  metadata?: Record<string, string>
}) {
  return getStripe().paymentIntents.create({
    amount: params.amount,
    currency: 'usd',
    customer: params.customerId,
    description: params.description || 'Patient Payment',
    metadata: params.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.retrieve(paymentIntentId)
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
) {
  return getStripe().paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  })
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.cancel(paymentIntentId)
}

// ============ PAYMENT METHODS ============

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(customerId: string) {
  return getStripe().paymentMethods.list({
    customer: customerId,
    type: 'card',
  })
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
) {
  return getStripe().paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(paymentMethodId: string) {
  return getStripe().paymentMethods.detach(paymentMethodId)
}

/**
 * Set default payment method for customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  return getStripe().customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}

// ============ SETUP INTENTS (Card Saving) ============

/**
 * Create a setup intent for saving a card
 */
export async function createSetupIntent(customerId: string) {
  return getStripe().setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  })
}

/**
 * Retrieve a setup intent
 */
export async function getSetupIntent(setupIntentId: string) {
  return getStripe().setupIntents.retrieve(setupIntentId)
}

// ============ CHARGE SAVED CARD ============

/**
 * Charge a customer using a saved payment method
 */
export async function chargeCustomer(
  customerId: string,
  paymentMethodId: string,
  amount: number, // Amount in cents
  description?: string,
  metadata?: Record<string, string>
) {
  return getStripe().paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    description: description || 'Patient Payment',
    metadata,
  })
}

// ============ REFUNDS ============

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Amount in cents (optional for partial refund)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    amount, // If not provided, full refund
    reason,
  })
}

/**
 * Retrieve a refund
 */
export async function getRefund(refundId: string) {
  return getStripe().refunds.retrieve(refundId)
}

// ============ WEBHOOKS ============

/**
 * Construct and verify webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret)
}

// ============ INVOICES ============

/**
 * Create an invoice for a customer
 */
export async function createInvoice(
  customerId: string,
  description?: string,
  metadata?: Record<string, string>
) {
  return getStripe().invoices.create({
    customer: customerId,
    description,
    metadata,
    auto_advance: true, // Auto-finalize
  })
}

/**
 * Add a line item to an invoice
 */
export async function addInvoiceLineItem(
  customerId: string,
  amount: number, // Amount in cents
  description: string
) {
  return getStripe().invoiceItems.create({
    customer: customerId,
    amount,
    currency: 'usd',
    description,
  })
}

/**
 * Finalize and send an invoice
 */
export async function finalizeInvoice(invoiceId: string) {
  return getStripe().invoices.finalizeInvoice(invoiceId)
}

/**
 * Pay an invoice immediately
 */
export async function payInvoice(invoiceId: string) {
  return getStripe().invoices.pay(invoiceId)
}

/**
 * List customer invoices
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 10
) {
  return getStripe().invoices.list({
    customer: customerId,
    limit,
  })
}

// ============ SUBSCRIPTIONS (for payment plans) ============

/**
 * Create a subscription for recurring payments (payment plans)
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  return getStripe().subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
  })
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId)
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId)
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: {
    priceId?: string
    metadata?: Record<string, string>
  }
) {
  const updateParams: Stripe.SubscriptionUpdateParams = {}

  if (params.priceId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
    updateParams.items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
      },
    ]
  }

  if (params.metadata) {
    updateParams.metadata = params.metadata
  }

  return getStripe().subscriptions.update(subscriptionId, updateParams)
}

// ============ PRODUCTS & PRICES ============

/**
 * Create a product
 */
export async function createProduct(name: string, description?: string) {
  return getStripe().products.create({
    name,
    description,
  })
}

/**
 * Create a price for a product
 */
export async function createPrice(
  productId: string,
  unitAmount: number, // Amount in cents
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    interval_count?: number
  }
) {
  return getStripe().prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring,
  })
}

// ============ BALANCE & TRANSACTIONS ============

/**
 * Get Stripe account balance
 */
export async function getBalance() {
  return getStripe().balance.retrieve()
}

/**
 * List balance transactions
 */
export async function listBalanceTransactions(limit: number = 10) {
  return getStripe().balanceTransactions.list({ limit })
}

// ============ HELPER FUNCTIONS ============

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Format amount for display
 */
export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export { getStripe }
