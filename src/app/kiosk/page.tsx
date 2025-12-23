'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KioskLayout } from '@/components/kiosk/KioskLayout'
import { Calendar, Clock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function KioskHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchMode, setSearchMode] = useState<'appointment' | 'dob' | null>(null)

  // Search form
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [appointmentCode, setAppointmentCode] = useState('')

  const startSession = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/kiosk/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: searchMode === 'dob' ? lastName : undefined,
          dateOfBirth: searchMode === 'dob' ? dateOfBirth : undefined,
          appointmentCode: searchMode === 'appointment' ? appointmentCode : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.data?.sessionToken) {
        // Store session token and navigate to verification
        sessionStorage.setItem('kioskSession', data.data.sessionToken)
        sessionStorage.setItem('kioskPatient', JSON.stringify(data.data.patient))
        sessionStorage.setItem('kioskAppointment', JSON.stringify(data.data.appointment))
        router.push('/kiosk/verify')
      } else {
        setError(data.error || 'Could not find your appointment. Please check your information or ask staff for help.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again or ask staff for help.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KioskLayout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome!</h1>
          <p className="text-xl text-gray-600">
            Please check in for your appointment
          </p>
        </div>

        {/* Check-in Options */}
        {!searchMode ? (
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card
              className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
              onClick={() => setSearchMode('appointment')}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">I have a code</h3>
                <p className="text-gray-500 text-sm">
                  Enter the code from your appointment reminder
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
              onClick={() => setSearchMode('dob')}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Look me up</h3>
                <p className="text-gray-500 text-sm">
                  Search using your name and date of birth
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 space-y-6">
              {searchMode === 'appointment' ? (
                <>
                  <div className="text-center mb-6">
                    <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Enter Your Appointment Code</h3>
                    <p className="text-sm text-gray-500">
                      Find this in your appointment reminder email or text
                    </p>
                  </div>
                  <div>
                    <Label>Appointment Code</Label>
                    <Input
                      className="mt-1 text-center text-2xl tracking-widest"
                      placeholder="ABC123"
                      value={appointmentCode}
                      onChange={(e) => setAppointmentCode(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <User className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Find Your Appointment</h3>
                    <p className="text-sm text-gray-500">
                      Enter your last name and date of birth
                    </p>
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      className="mt-1"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      className="mt-1"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSearchMode(null)
                    setError('')
                    setLastName('')
                    setDateOfBirth('')
                    setAppointmentCode('')
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={startSession}
                  disabled={loading || (searchMode === 'appointment' ? !appointmentCode : !lastName || !dateOfBirth)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Date/Time */}
        <div className="text-center text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </KioskLayout>
  )
}
