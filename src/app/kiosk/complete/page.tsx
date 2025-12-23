'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KioskLayout } from '@/components/kiosk/KioskLayout'
import {
  CheckCircle2,
  Clock,
  User,
  MapPin,
  ArrowRight,
  Printer,
  Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function KioskCompletePage() {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    completeCheckIn()
  }, [])

  const completeCheckIn = async () => {
    const patientData = sessionStorage.getItem('kioskPatient')
    const appointmentData = sessionStorage.getItem('kioskAppointment')
    const paymentData = sessionStorage.getItem('kioskPayment')
    const sessionToken = sessionStorage.getItem('kioskSession')

    if (!patientData || !appointmentData || !sessionToken) {
      router.push('/kiosk')
      return
    }

    setPatient(JSON.parse(patientData))
    setAppointment(JSON.parse(appointmentData))
    if (paymentData) {
      setPayment(JSON.parse(paymentData))
    }

    setCompleting(true)

    try {
      const response = await fetch('/api/kiosk/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      })

      if (!response.ok) {
        console.error('Failed to complete check-in')
      }
    } catch (error) {
      console.error('Error completing check-in:', error)
    } finally {
      setCompleting(false)
      setLoading(false)
    }
  }

  const startNewSession = () => {
    sessionStorage.removeItem('kioskSession')
    sessionStorage.removeItem('kioskPatient')
    sessionStorage.removeItem('kioskAppointment')
    sessionStorage.removeItem('kioskPayment')
    router.push('/kiosk')
  }

  if (loading) {
    return (
      <KioskLayout step={4} title="Completing Check-In">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
          <p className="text-gray-500">Completing your check-in...</p>
        </div>
      </KioskLayout>
    )
  }

  return (
    <KioskLayout step={4} title="">
      <div className="space-y-8 max-w-xl mx-auto text-center">
        {/* Success Animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-green-100 animate-ping opacity-25" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're All Checked In!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you, {patient?.firstName}
          </p>
        </div>

        {/* Appointment Details */}
        <Card className="text-left">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-teal-100 rounded-full p-2">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">
                  {appointment?.providerName || 'Your Provider'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Appointment Time</p>
                <p className="font-medium">
                  {appointment?.appointmentTime
                    ? new Date(appointment.appointmentTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : 'Your scheduled time'}
                </p>
              </div>
            </div>

            {appointment?.room && (
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{appointment.room}</p>
                </div>
              </div>
            )}

            {payment && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Received</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Transaction ID: {payment.transactionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-teal-50 border-teal-200 text-left">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-teal-900 mb-3">What's Next?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-teal-600" />
                <span className="text-teal-800">
                  Please have a seat in the waiting area
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-teal-600" />
                <span className="text-teal-800">
                  A staff member will call your name shortly
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-teal-600" />
                <span className="text-teal-800">
                  Please have your insurance card ready if needed
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pb-16">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Confirmation
          </Button>

          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 h-12"
            onClick={startNewSession}
          >
            Done
          </Button>

          <p className="text-sm text-gray-400">
            This screen will automatically reset in 30 seconds
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}
