'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KioskLayout } from '@/components/kiosk/KioskLayout'
import {
  CreditCard,
  DollarSign,
  Shield,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function KioskPaymentPage() {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [copayAmount, setCopayAmount] = useState(0)
  const [balanceDue, setBalanceDue] = useState(0)
  const [paymentChoice, setPaymentChoice] = useState<'copay' | 'full' | 'skip' | null>(null)

  // Payment form
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    const patientData = sessionStorage.getItem('kioskPatient')
    const appointmentData = sessionStorage.getItem('kioskAppointment')
    const sessionToken = sessionStorage.getItem('kioskSession')

    if (!patientData || !appointmentData || !sessionToken) {
      router.push('/kiosk')
      return
    }

    setPatient(JSON.parse(patientData))
    setAppointment(JSON.parse(appointmentData))

    // Fetch payment info
    fetchPaymentInfo(sessionToken)
  }, [router])

  const fetchPaymentInfo = async (sessionToken: string) => {
    setLoading(true)
    try {
      // In a real app, this would fetch copay and balance info
      // For now, we'll use mock data from the appointment
      const appt = JSON.parse(sessionStorage.getItem('kioskAppointment') || '{}')
      setCopayAmount(appt.copay || 25)
      setBalanceDue(appt.balance || 0)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ').slice(0, 19) : ''
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
  }

  const processPayment = async () => {
    if (paymentChoice === 'skip') {
      router.push('/kiosk/complete')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const sessionToken = sessionStorage.getItem('kioskSession')
      const amount = paymentChoice === 'copay' ? copayAmount : (copayAmount + balanceDue)

      const response = await fetch('/api/kiosk/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          amount,
          paymentMethod: {
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiry,
            cvv,
            cardName,
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.data?.success) {
        sessionStorage.setItem('kioskPayment', JSON.stringify({
          amount,
          transactionId: data.data.transactionId,
        }))
        router.push('/kiosk/complete')
      } else {
        setError(data.error || 'Payment failed. Please try again or ask staff for help.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading || !patient) {
    return (
      <KioskLayout step={3} title="Payment">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </KioskLayout>
    )
  }

  const totalDue = copayAmount + balanceDue

  return (
    <KioskLayout step={3} title="Payment">
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Amount Due Summary */}
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700">Amount Due Today</p>
                <p className="text-3xl font-bold text-teal-900">
                  {formatCurrency(totalDue)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-teal-600" />
            </div>
            {balanceDue > 0 && (
              <div className="mt-4 pt-4 border-t border-teal-200 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-teal-700">Copay</span>
                  <span className="font-medium">{formatCurrency(copayAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal-700">Previous Balance</span>
                  <span className="font-medium">{formatCurrency(balanceDue)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!paymentChoice ? (
          <>
            <p className="text-gray-600 text-center">
              How would you like to proceed?
            </p>

            <div className="space-y-3">
              <Card
                className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
                onClick={() => setPaymentChoice('copay')}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-100 rounded-full p-3">
                      <CreditCard className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pay copay now</p>
                      <p className="text-sm text-gray-500">{formatCurrency(copayAmount)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              {balanceDue > 0 && (
                <Card
                  className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
                  onClick={() => setPaymentChoice('full')}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 rounded-full p-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pay full balance</p>
                        <p className="text-sm text-gray-500">{formatCurrency(totalDue)}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card
                className="cursor-pointer hover:border-gray-400 transition-all"
                onClick={() => setPaymentChoice('skip')}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Clock className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">Pay at checkout</p>
                      <p className="text-sm text-gray-500">Skip for now</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : paymentChoice === 'skip' ? (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Skip Payment</h3>
                <p className="text-sm text-gray-500">
                  You can pay at checkout after your visit
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentChoice(null)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={() => router.push('/kiosk/complete')}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enter Card Details
              </CardTitle>
              <CardDescription>
                Pay {paymentChoice === 'copay' ? 'copay' : 'full balance'}: {formatCurrency(paymentChoice === 'copay' ? copayAmount : totalDue)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Card Number</Label>
                <Input
                  className="mt-1 font-mono"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>

              <div>
                <Label>Name on Card</Label>
                <Input
                  className="mt-1"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    className="mt-1"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    className="mt-1"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <Shield className="h-4 w-4 mt-0.5 text-green-600" />
                <span>
                  Your payment is secured with industry-standard encryption.
                </span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setPaymentChoice(null)
                    setError('')
                  }}
                  disabled={processing}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={processPayment}
                  disabled={processing || !cardNumber || !expiry || !cvv || !cardName}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(paymentChoice === 'copay' ? copayAmount : totalDue)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </KioskLayout>
  )
}
