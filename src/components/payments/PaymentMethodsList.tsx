'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface PaymentMethodsListProps {
  patientId: string
  onSelect?: (paymentMethodId: string) => void
  selectable?: boolean
}

const cardBrandIcons: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
  default: '💳',
}

export function PaymentMethodsList({
  patientId,
  onSelect,
  selectable = false,
}: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/stripe/payment-methods?patientId=${patientId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }

      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [patientId])

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this card?')) {
      return
    }

    try {
      setDeletingId(paymentMethodId)

      const response = await fetch('/api/stripe/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete payment method')
      }

      // Remove from local state
      setPaymentMethods((prev) =>
        prev.filter((pm) => pm.id !== paymentMethodId)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelect = (paymentMethodId: string) => {
    setSelectedId(paymentMethodId)
    onSelect?.(paymentMethodId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No saved payment methods</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((pm) => (
        <div
          key={pm.id}
          className={`flex items-center justify-between p-4 border rounded-lg ${
            selectable ? 'cursor-pointer hover:border-teal-500' : ''
          } ${selectedId === pm.id ? 'border-teal-500 bg-teal-50' : ''}`}
          onClick={() => selectable && handleSelect(pm.id)}
        >
          <div className="flex items-center gap-3">
            {selectable && (
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedId === pm.id}
                onChange={() => handleSelect(pm.id)}
                className="h-4 w-4 text-teal-600"
              />
            )}
            <span className="text-2xl">
              {cardBrandIcons[pm.brand?.toLowerCase()] || cardBrandIcons.default}
            </span>
            <div>
              <p className="font-medium capitalize">
                {pm.brand} •••• {pm.last4}
              </p>
              <p className="text-sm text-gray-500">
                Expires {pm.expMonth}/{pm.expYear}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(pm.id)
            }}
            disabled={deletingId === pm.id}
            className="text-gray-400 hover:text-red-500"
          >
            {deletingId === pm.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
