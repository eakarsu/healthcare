'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { KioskLayout } from '@/components/kiosk/KioskLayout'
import {
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Edit2,
} from 'lucide-react'

export default function KioskDemographicsPage() {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Editable fields
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  useEffect(() => {
    const patientData = sessionStorage.getItem('kioskPatient')
    const sessionToken = sessionStorage.getItem('kioskSession')

    if (!patientData || !sessionToken) {
      router.push('/kiosk')
      return
    }

    const p = JSON.parse(patientData)
    setPatient(p)

    // Pre-fill form
    setPhone(p.phone || '')
    setEmail(p.email || '')
    setAddress(p.address || '')
    setCity(p.city || '')
    setState(p.state || '')
    setZipCode(p.zipCode || '')
    setEmergencyContact(p.emergencyContact || '')
    setEmergencyPhone(p.emergencyPhone || '')
  }, [router])

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const handlePhoneChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setter(formatted)
  }

  const saveChanges = async () => {
    setLoading(true)
    setError('')

    try {
      const sessionToken = sessionStorage.getItem('kioskSession')
      const response = await fetch('/api/kiosk/demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          demographics: {
            phone: phone.replace(/\D/g, ''),
            email,
            address,
            city,
            state,
            zipCode,
            emergencyContact,
            emergencyPhone: emergencyPhone.replace(/\D/g, ''),
          },
        }),
      })

      if (response.ok) {
        setEditing(false)
        // Update stored patient data
        const updatedPatient = {
          ...patient,
          phone,
          email,
          address,
          city,
          state,
          zipCode,
          emergencyContact,
          emergencyPhone,
        }
        setPatient(updatedPatient)
        sessionStorage.setItem('kioskPatient', JSON.stringify(updatedPatient))
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save changes')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const continueToPayment = () => {
    if (!confirmed) {
      setError('Please confirm your information is correct')
      return
    }
    router.push('/kiosk/payment')
  }

  if (!patient) {
    return (
      <KioskLayout step={2} title="Review Your Information">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </KioskLayout>
    )
  }

  return (
    <KioskLayout step={2} title="Review Your Information">
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-gray-600">
          Please review your information and make any necessary updates.
        </p>

        {editing ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Update Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    className="mt-1"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={handlePhoneChange(setPhone)}
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label>Street Address</Label>
                <Input
                  className="mt-1"
                  placeholder="123 Main St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    className="mt-1"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    className="mt-1"
                    placeholder="CA"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    className="mt-1"
                    placeholder="12345"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      className="mt-1"
                      placeholder="John Smith"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      className="mt-1"
                      placeholder="(555) 123-4567"
                      value={emergencyPhone}
                      onChange={handlePhoneChange(setEmergencyPhone)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={saveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Display Current Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patient</p>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{phone || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{email || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">
                        {address ? (
                          <>
                            {address}<br />
                            {city}, {state} {zipCode}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">
                      {emergencyContact || 'Not provided'}
                      {emergencyPhone && ` - ${emergencyPhone}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Update My Information
              </Button>

              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm"
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked === true)}
                    />
                    <label
                      htmlFor="confirm"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      I confirm that my information above is correct and up to date.
                    </label>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 h-12"
                onClick={continueToPayment}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </KioskLayout>
  )
}
