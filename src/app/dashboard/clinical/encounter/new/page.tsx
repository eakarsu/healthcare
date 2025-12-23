'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Stethoscope, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface AppointmentDetails {
  id: string
  scheduledStart: string
  chiefComplaint: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    dateOfBirth: string
  }
  provider: {
    id: string
    user: { firstName: string; lastName: string }
  }
  type: { name: string }
}

export default function NewEncounterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const appointmentId = searchParams.get('appointmentId')

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [chiefComplaint, setChiefComplaint] = useState('')

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
        setChiefComplaint(data.chiefComplaint || '')
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEncounter = async () => {
    if (!appointmentId) return

    setCreating(true)
    try {
      const response = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          chiefComplaint,
        }),
      })

      if (response.ok) {
        const encounter = await response.json()
        toast({
          title: 'Encounter started',
          description: 'You can now document the visit.',
        })
        router.push(`/dashboard/clinical/encounter/${encounter.id}`)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to start encounter',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create encounter:', error)
      toast({
        title: 'Error',
        description: 'Failed to start encounter',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500">
        <Stethoscope className="mb-4 h-12 w-12 text-gray-300" />
        <p>Appointment not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/clinical">Back to Clinical</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clinical">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start New Encounter</h1>
          <p className="text-gray-500">
            {format(new Date(appointment.scheduledStart), 'EEEE, MMMM d, yyyy h:mm a')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xl font-semibold">
                {appointment.patient.lastName}, {appointment.patient.firstName}
              </p>
              <p className="text-gray-500">MRN: {appointment.patient.mrn}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p>{format(new Date(appointment.patient.dateOfBirth), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">Age</p>
                <p>{calculateAge(appointment.patient.dateOfBirth)} years</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Visit Type</p>
                <p>{appointment.type.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Provider</p>
                <p>Dr. {appointment.provider.user.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chief Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chiefComplaint">
              What is the primary reason for today&apos;s visit?
            </Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Enter the patient's chief complaint..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/clinical">Cancel</Link>
            </Button>
            <Button
              onClick={startEncounter}
              disabled={creating}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
            >
              {creating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Starting...
                </>
              ) : (
                <>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Start Encounter
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
