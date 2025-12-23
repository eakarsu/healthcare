'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { format, addDays, parseISO, setHours, setMinutes } from 'date-fns'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  phone: string
}

interface Provider {
  id: string
  user: {
    firstName: string
    lastName: string
  }
}

interface AppointmentType {
  id: string
  name: string
  duration: number
  color: string | null
}

interface Location {
  id: string
  name: string
  address: string
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
]

export default function NewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const preselectedPatientId = searchParams.get('patientId')

  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [providers, setProviders] = useState<Provider[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchPatients()
    fetchProviders()
    fetchAppointmentTypes()
    fetchLocations()
    if (preselectedPatientId) {
      fetchPatientById(preselectedPatientId)
    }
  }, [preselectedPatientId])

  const fetchPatients = async () => {
    setLoadingPatients(true)
    try {
      const response = await fetch('/api/patients?limit=100')
      const data = await response.json()
      setPatients(data.data || [])
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const fetchPatientById = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPatient(data)
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      const data = await response.json()
      setProviders(data.data || [])
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch('/api/appointment-types')
      const data = await response.json()
      setAppointmentTypes(data.data || [])
    } catch (error) {
      console.error('Failed to fetch appointment types:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const data = await response.json()
      setLocations(data.data || [])
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const calculateEndTime = () => {
    if (!selectedTime || !selectedType) return null
    const type = appointmentTypes.find((t) => t.id === selectedType)
    if (!type) return null

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startDate = setMinutes(setHours(new Date(), hours), minutes)
    const endDate = new Date(startDate.getTime() + type.duration * 60000)
    return format(endDate, 'HH:mm')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient || !selectedProvider || !selectedType || !selectedDate || !selectedTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const appointmentDate = parseISO(selectedDate)
      const scheduledStart = setMinutes(setHours(appointmentDate, hours), minutes)

      const type = appointmentTypes.find((t) => t.id === selectedType)
      const scheduledEnd = new Date(scheduledStart.getTime() + (type?.duration || 30) * 60000)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          providerId: selectedProvider,
          appointmentTypeId: selectedType,
          locationId: selectedLocation || undefined,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          chiefComplaint: chiefComplaint || undefined,
          notes: notes || undefined,
          status: 'SCHEDULED',
        }),
      })

      if (response.ok) {
        toast({
          title: 'Appointment scheduled',
          description: `Appointment has been scheduled for ${format(scheduledStart, 'MMM d, yyyy')} at ${format(scheduledStart, 'h:mm a')}`,
        })
        router.push('/schedule/appointments')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create appointment')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule appointment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule New Appointment</h1>
          <p className="text-gray-500">Create a new appointment for a patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPatient ? (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-teal-50 border-teal-200">
                  <div>
                    <p className="font-medium text-lg">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
                    <p className="text-sm text-gray-600">
                      DOB: {format(parseISO(selectedPatient.dateOfBirth), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {selectedPatient.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Select Patient *</Label>
                  <Select
                    value=""
                    onValueChange={(id) => {
                      const patient = patients.find(p => p.id === id)
                      if (patient) setSelectedPatient(patient)
                    }}
                    disabled={loadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.lastName}, {patient.firstName} - MRN: {patient.mrn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Textarea
                  placeholder="Reason for visit..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider *</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        Dr. {provider.user.firstName} {provider.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => {
                      const [h, m] = time.split(':')
                      const displayTime = format(setMinutes(setHours(new Date(), parseInt(h)), parseInt(m)), 'h:mm a')
                      return (
                        <SelectItem key={time} value={time}>
                          {displayTime}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedTime && selectedType && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Duration: {appointmentTypes.find((t) => t.id === selectedType)?.duration} minutes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Ends at: {calculateEndTime() && format(
                      setMinutes(
                        setHours(new Date(), parseInt(calculateEndTime()!.split(':')[0])),
                        parseInt(calculateEndTime()!.split(':')[1])
                      ),
                      'h:mm a'
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !selectedPatient}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Scheduling...
              </>
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
