'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Play,
  LogOut,
  Edit,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { getStatusColor } from '@/lib/utils'

interface Appointment {
  id: string
  scheduledStart: string
  scheduledEnd: string
  status: string
  chiefComplaint: string | null
  notes: string | null
  checkedInAt: string | null
  checkedOutAt: string | null
  isNewPatient: boolean
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    dateOfBirth: string
    phone: string
    email: string | null
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  }
  type: {
    id: string
    name: string
    duration: number
    color: string | null
  }
  location: {
    id: string
    name: string
    address: string
  } | null
  room: {
    id: string
    name: string
  } | null
}

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchAppointment()
  }, [params.id])

  const fetchAppointment = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
      } else {
        toast({
          title: 'Error',
          description: 'Appointment not found',
          variant: 'destructive',
        })
        router.push('/dashboard/schedule')
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to load appointment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (action: string) => {
    setProcessing(true)
    try {
      let endpoint = `/api/appointments/${params.id}`
      let method = 'PUT'
      let body: any = {}

      switch (action) {
        case 'confirm':
          body = { status: 'CONFIRMED' }
          break
        case 'check-in':
          endpoint = `/api/appointments/${params.id}/check-in`
          method = 'POST'
          body = { verifiedInsurance: true }
          break
        case 'check-out':
          endpoint = `/api/appointments/${params.id}/check-out`
          method = 'POST'
          body = {}
          break
        case 'no-show':
          body = { status: 'NO_SHOW' }
          break
        case 'cancel':
          body = { status: 'CANCELLED', notes: cancelReason }
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Appointment ${action.replace('-', ' ')}ed successfully`,
        })
        fetchAppointment()
        setCancelDialogOpen(false)
        setCancelReason('')
      } else {
        throw new Error('Failed to update appointment')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const canConfirm = appointment.status === 'SCHEDULED'
  const canCheckIn = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
  const canCheckOut = ['CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status)
  const canCancel = !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)
  const canStartEncounter = appointment.status === 'CHECKED_IN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-500">
              {format(parseISO(appointment.scheduledStart), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <Badge className={`text-sm ${getStatusColor(appointment.status)}`}>
          {appointment.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {format(parseISO(appointment.scheduledStart), 'MMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(parseISO(appointment.scheduledStart), 'h:mm a')} - {format(parseISO(appointment.scheduledEnd), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: appointment.type.color || '#6b7280' }}
                    />
                    <p className="font-medium">{appointment.type.name}</p>
                  </div>
                  <p className="text-gray-600">{appointment.type.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">
                    Dr. {appointment.provider.user.firstName} {appointment.provider.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{appointment.location?.name || 'Not specified'}</p>
                  {appointment.room && (
                    <p className="text-gray-600">{appointment.room.name}</p>
                  )}
                </div>
              </div>

              {appointment.chiefComplaint && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Chief Complaint</p>
                    <p className="font-medium">{appointment.chiefComplaint}</p>
                  </div>
                </>
              )}

              {appointment.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              )}

              {appointment.checkedInAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Checked in at {format(parseISO(appointment.checkedInAt), 'h:mm a')}
                  </span>
                </div>
              )}

              {appointment.checkedOutAt && (
                <div className="flex items-center gap-2 text-blue-600">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">
                    Checked out at {format(parseISO(appointment.checkedOutAt), 'h:mm a')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <Link
                      href={`/dashboard/patients/${appointment.patient.id}`}
                      className="text-lg font-medium hover:text-teal-600 hover:underline"
                    >
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </Link>
                    {appointment.isNewPatient && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">New Patient</Badge>
                    )}
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-500">MRN:</span> {appointment.patient.mrn}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">DOB:</span>{' '}
                      {format(parseISO(appointment.patient.dateOfBirth), 'MMM d, yyyy')}
                    </p>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="h-3 w-3" />
                      {appointment.patient.phone}
                    </div>
                    {appointment.patient.email && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="h-3 w-3" />
                        {appointment.patient.email}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/patients/${appointment.patient.id}`}>
                    View Chart
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canConfirm && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800"
                  onClick={() => handleStatusChange('confirm')}
                  disabled={processing}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Appointment
                </Button>
              )}

              {canCheckIn && (
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={() => handleStatusChange('check-in')}
                  disabled={processing}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Check In Patient
                </Button>
              )}

              {canStartEncounter && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/dashboard/clinical/encounter/new?appointmentId=${appointment.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Start Encounter
                  </Link>
                </Button>
              )}

              {canCheckOut && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusChange('check-out')}
                  disabled={processing}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              )}

              <Separator />

              <Button className="w-full" variant="outline" asChild>
                <Link href={`/dashboard/schedule/appointments/new?reschedule=${appointment.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Reschedule
                </Link>
              </Button>

              {canCancel && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Cancel Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-gray-600">
                        Are you sure you want to cancel this appointment for{' '}
                        <strong>
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </strong>{' '}
                        on{' '}
                        <strong>
                          {format(parseISO(appointment.scheduledStart), 'MMM d, yyyy')} at{' '}
                          {format(parseISO(appointment.scheduledStart), 'h:mm a')}
                        </strong>
                        ?
                      </p>
                      <div className="space-y-2">
                        <Label>Cancellation Reason (optional)</Label>
                        <Textarea
                          placeholder="Enter reason for cancellation..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                          Keep Appointment
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusChange('cancel')}
                          disabled={processing}
                        >
                          {processing ? 'Cancelling...' : 'Cancel Appointment'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {canCancel && (
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => handleStatusChange('no-show')}
                  disabled={processing}
                >
                  Mark as No-Show
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
