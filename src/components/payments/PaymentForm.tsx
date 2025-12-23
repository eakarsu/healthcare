'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface PaymentFormProps {
  amount: number // Amount in dollars
  patientId: string
  patientName: string
  description?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export function PaymentForm({
  amount,
  patientId,
  patientName,
  description,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing/payment-success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || 'An unexpected error occurred.')
        onError?.(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsSuccess(true)
        setMessage('Payment successful!')

        // Confirm payment in our backend
        await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            patientId,
          }),
        })

        onSuccess?.(paymentIntent.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setMessage(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
        <p className="text-gray-600 mt-2">
          ${amount.toFixed(2)} has been processed for {patientName}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Patient:</span>
          <span className="font-medium">{patientName}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Amount:</span>
          <span className="text-xl font-bold text-teal-600">
            ${amount.toFixed(2)}
          </span>
        </div>
        {description && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">For:</span>
            <span className="text-sm">{description}</span>
          </div>
        )}
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            isSuccess
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}
