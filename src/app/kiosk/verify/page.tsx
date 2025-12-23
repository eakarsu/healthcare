'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KioskLayout } from '@/components/kiosk/KioskLayout'
import { Shield, Smartphone, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

type VerificationMethod = 'sms' | 'email' | 'dob'

export default function KioskVerifyPage() {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [dobConfirm, setDobConfirm] = useState('')

  useEffect(() => {
    const patientData = sessionStorage.getItem('kioskPatient')
    const appointmentData = sessionStorage.getItem('kioskAppointment')

    if (!patientData || !appointmentData) {
      router.push('/kiosk')
      return
    }

    setPatient(JSON.parse(patientData))
    setAppointment(JSON.parse(appointmentData))
  }, [router])

  const sendVerificationCode = async (method: VerificationMethod) => {
    setLoading(true)
    setError('')

    try {
      const sessionToken = sessionStorage.getItem('kioskSession')
      const response = await fetch('/api/kiosk/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          method,
          sendCode: true,
        }),
      })

      if (response.ok) {
        setVerificationMethod(method)
        if (method !== 'dob') {
          setCodeSent(true)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyIdentity = async () => {
    setLoading(true)
    setError('')

    try {
      const sessionToken = sessionStorage.getItem('kioskSession')
      const response = await fetch('/api/kiosk/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          method: verificationMethod,
          code: verificationMethod === 'dob' ? undefined : verificationCode,
          dateOfBirth: verificationMethod === 'dob' ? dobConfirm : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.data?.verified) {
        router.push('/kiosk/demographics')
      } else {
        setError(data.error || 'Verification failed. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!patient) {
    return (
      <KioskLayout step={1} title="Verify Your Identity">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </KioskLayout>
    )
  }

  const maskedPhone = patient.phone
    ? `(***) ***-${patient.phone.slice(-4)}`
    : null
  const maskedEmail = patient.email
    ? `${patient.email[0]}***@${patient.email.split('@')[1]}`
    : null

  return (
    <KioskLayout step={1} title="Verify Your Identity">
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Patient Confirmation */}
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-teal-600" />
              <div>
                <p className="text-sm text-teal-700">Found your appointment</p>
                <p className="text-xl font-bold text-teal-900">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-teal-700">
                  {new Date(appointment.appointmentTime).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!verificationMethod ? (
          <>
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                For your security, please verify your identity
              </p>
            </div>

            <div className="space-y-3">
              {maskedPhone && (
                <Card
                  className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
                  onClick={() => sendVerificationCode('sms')}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Text me a code</p>
                        <p className="text-sm text-gray-500">{maskedPhone}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {maskedEmail && (
                <Card
                  className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
                  onClick={() => sendVerificationCode('email')}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Email me a code</p>
                        <p className="text-sm text-gray-500">{maskedEmail}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card
                className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all"
                onClick={() => setVerificationMethod('dob')}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Confirm date of birth</p>
                      <p className="text-sm text-gray-500">Enter your date of birth</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 space-y-6">
              {verificationMethod === 'dob' ? (
                <>
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Confirm Your Date of Birth</h3>
                    <p className="text-sm text-gray-500">
                      Please enter your date of birth to verify
                    </p>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      className="mt-1"
                      type="date"
                      value={dobConfirm}
                      onChange={(e) => setDobConfirm(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    {verificationMethod === 'sms' ? (
                      <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    ) : (
                      <Mail className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                    )}
                    <h3 className="text-lg font-semibold">Enter Verification Code</h3>
                    <p className="text-sm text-gray-500">
                      We sent a 6-digit code to {verificationMethod === 'sms' ? maskedPhone : maskedEmail}
                    </p>
                  </div>
                  <div>
                    <Label>Verification Code</Label>
                    <Input
                      className="mt-1 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => sendVerificationCode(verificationMethod)}
                      disabled={loading}
                    >
                      Resend
                    </button>
                  </p>
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
                    setVerificationMethod(null)
                    setCodeSent(false)
                    setVerificationCode('')
                    setDobConfirm('')
                    setError('')
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={verifyIdentity}
                  disabled={
                    loading ||
                    (verificationMethod === 'dob' ? !dobConfirm : verificationCode.length !== 6)
                  }
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify
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
