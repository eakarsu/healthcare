'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { format, addDays } from 'date-fns'

interface Appointment {
  id: string
  date: string
  time: string
  provider: string
  type: string
  location: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

export default function PortalAppointmentsPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')

  // Mock data
  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      time: '10:00 AM',
      provider: 'Dr. Sarah Wilson',
      type: 'Follow-up Visit',
      location: 'Main Office - Room 102',
      status: 'confirmed',
    },
    {
      id: '2',
      date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      time: '2:30 PM',
      provider: 'Dr. Michael Chen',
      type: 'Annual Physical',
      location: 'Main Office - Room 105',
      status: 'scheduled',
    },
  ]

  const pastAppointments: Appointment[] = [
    {
      id: '3',
      date: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
      time: '9:00 AM',
      provider: 'Dr. Sarah Wilson',
      type: 'Sick Visit',
      location: 'Main Office - Room 102',
      status: 'completed',
    },
    {
      id: '4',
      date: format(addDays(new Date(), -90), 'yyyy-MM-dd'),
      time: '11:00 AM',
      provider: 'Dr. Sarah Wilson',
      type: 'Follow-up Visit',
      location: 'Main Office - Room 102',
      status: 'completed',
    },
  ]

  const availableSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleSchedule = () => {
    if (!selectedProvider || !selectedType || !selectedDate || !selectedTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Appointment requested',
      description: 'We will confirm your appointment shortly.',
    })
    setIsDialogOpen(false)
    // Reset form
    setSelectedProvider('')
    setSelectedType('')
    setSelectedDate('')
    setSelectedTime('')
    setReason('')
  }

  const handleCancel = (id: string) => {
    toast({
      title: 'Appointment cancelled',
      description: 'Your appointment has been cancelled.',
    })
  }

  const AppointmentCard = ({ appt, showActions = true }: { appt: Appointment; showActions?: boolean }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50">
      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-teal-50 text-teal-700 flex-shrink-0">
        <span className="text-lg font-bold">{format(new Date(appt.date), 'd')}</span>
        <span className="text-xs">{format(new Date(appt.date), 'MMM')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{appt.type}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <User className="h-3 w-3" />
              {appt.provider}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {appt.time}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              {appt.location}
            </div>
          </div>
          {getStatusBadge(appt.status)}
        </div>
        {showActions && appt.status !== 'completed' && appt.status !== 'cancelled' && (
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleCancel(appt.id)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">View and manage your appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-wilson">Dr. Sarah Wilson</SelectItem>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followup">Follow-up Visit</SelectItem>
                    <SelectItem value="sick">Sick Visit</SelectItem>
                    <SelectItem value="physical">Annual Physical</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit (optional)</Label>
                <Textarea
                  placeholder="Briefly describe the reason for your visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSchedule} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                  Request Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="pt-6">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Schedule an Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt) => (
                    <AppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardContent className="pt-6">
              {pastAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No past appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appt) => (
                    <AppointmentCard key={appt.id} appt={appt} showActions={false} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appointment Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p>Please arrive 15 minutes early for your appointment.</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p>Cancellations must be made at least 24 hours in advance to avoid a fee.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
            <p>Bring your insurance card and photo ID to each visit.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
