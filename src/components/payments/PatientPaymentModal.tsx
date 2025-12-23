'use client'

import { useState, useEffect } from 'react'
import { StripeProvider } from './StripeProvider'
import { PaymentForm } from './PaymentForm'
import { SaveCardForm } from './SaveCardForm'
import { PaymentMethodsList } from './PaymentMethodsList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Plus, Loader2 } from 'lucide-react'

interface PatientPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  amount: number
  description?: string
  onSuccess?: () => void
}

export function PatientPaymentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  amount,
  description,
  onSuccess,
}: PatientPaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('new-card')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [isChargingSavedCard, setIsChargingSavedCard] = useState(false)
  const [hasSavedCards, setHasSavedCards] = useState(false)

  useEffect(() => {
    if (isOpen && amount > 0) {
      createPaymentIntent()
      checkForSavedCards()
    }
  }, [isOpen, amount, patientId])

  const checkForSavedCards = async () => {
    try {
      const response = await fetch(`/api/stripe/payment-methods?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        const hasCards = data.paymentMethods && data.paymentMethods.length > 0
        setHasSavedCards(hasCards)
        if (hasCards) {
          setActiveTab('saved-cards')
        }
      }
    } catch {
      // Ignore errors, just default to new card tab
    }
  }

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          amount,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleClose = () => {
    setClientSecret(null)
    setError(null)
    setActiveTab('new-card')
    setSelectedPaymentMethodId(null)
    setHasSavedCards(false)
    onClose()
  }

  const handleChargeSavedCard = async () => {
    if (!selectedPaymentMethodId) {
      setError('Please select a payment method')
      return
    }

    try {
      setIsChargingSavedCard(true)
      setError(null)

      const response = await fetch('/api/payments/charge-saved-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          paymentMethodId: selectedPaymentMethodId,
          amount,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      handleSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsChargingSavedCard(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Collect Payment
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : clientSecret ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new-card">New Card</TabsTrigger>
              <TabsTrigger value="saved-cards">Saved Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="new-card" className="mt-4">
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  amount={amount}
                  patientId={patientId}
                  patientName={patientName}
                  description={description}
                  onSuccess={handleSuccess}
                  onError={setError}
                />
              </StripeProvider>
            </TabsContent>

            <TabsContent value="saved-cards" className="mt-4">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    Amount: ${amount.toFixed(2)}
                  </p>
                  {description && (
                    <p className="text-sm text-gray-500">{description}</p>
                  )}
                </div>
                <PaymentMethodsList
                  patientId={patientId}
                  selectable
                  onSelect={setSelectedPaymentMethodId}
                />
                <Button
                  onClick={handleChargeSavedCard}
                  disabled={!selectedPaymentMethodId || isChargingSavedCard}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {isChargingSavedCard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${amount.toFixed(2)} with Selected Card</>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center p-8 text-gray-500">
            Unable to initialize payment. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Simplified version for just saving a card
interface SaveCardModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  onSuccess?: () => void
}

export function SaveCardModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: SaveCardModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Payment Method
          </DialogTitle>
        </DialogHeader>

        <StripeProvider>
          <SaveCardForm
            patientId={patientId}
            onSuccess={handleSuccess}
          />
        </StripeProvider>
      </DialogContent>
    </Dialog>
  )
}
