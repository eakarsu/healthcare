'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react'
import { format, parseISO, isToday, isTomorrow, startOfDay, endOfDay, addDays } from 'date-fns'
import { getStatusColor } from '@/lib/utils'

interface Appointment {
  id: string
  scheduledStart: string
  scheduledEnd: string
  status: string
  chiefComplaint: string | null
  notes: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    dateOfBirth: string
    phone: string
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  }
  type: {
    name: string
    duration: number
  }
  location: {
    name: string
  } | null
}

interface Provider {
  id: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function AppointmentsListPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchProviders()
  }, [statusFilter, providerFilter, dateFilter])

  const getDateRange = () => {
    const today = new Date()
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(today), end: endOfDay(today) }
      case 'tomorrow':
        return { start: startOfDay(addDays(today, 1)), end: endOfDay(addDays(today, 1)) }
      case 'week':
        return { start: startOfDay(today), end: endOfDay(addDays(today, 7)) }
      case 'month':
        return { start: startOfDay(today), end: endOfDay(addDays(today, 30)) }
      default:
        return { start: startOfDay(today), end: endOfDay(today) }
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const { start, end } = getDateRange()
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (providerFilter !== 'all') {
        params.set('providerId', providerFilter)
      }

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()
      setAppointments(data.data || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
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

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Status updated',
          description: `Appointment marked as ${newStatus}`,
        })
        fetchAppointments()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      })
    }
  }

  const filteredAppointments = appointments.filter((appt) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      appt.patient.firstName.toLowerCase().includes(searchLower) ||
      appt.patient.lastName.toLowerCase().includes(searchLower) ||
      appt.patient.mrn.toLowerCase().includes(searchLower)
    )
  })

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === 'SCHEDULED').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    checkedIn: appointments.filter((a) => a.status === 'CHECKED_IN').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage and view all scheduled appointments</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
          <Link href="/dashboard/schedule/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-500">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn}</p>
              <p className="text-sm text-gray-500">Checked In</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by patient name or MRN..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">Next 7 Days</SelectItem>
                <SelectItem value="month">Next 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-48">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    Dr. {provider.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow
                    key={appt.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedAppointment(appt)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{format(parseISO(appt.scheduledStart), 'h:mm a')}</p>
                        <p className="text-xs text-gray-500">{getDateLabel(appt.scheduledStart)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/patients/${appt.patient.id}`} className="hover:underline">
                        <p className="font-medium">
                          {appt.patient.lastName}, {appt.patient.firstName}
                        </p>
                        <p className="text-xs text-gray-500">MRN: {appt.patient.mrn}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      Dr. {appt.provider.user.lastName}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{appt.type.name}</p>
                        <p className="text-xs text-gray-500">{appt.type.duration} min</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-sm text-gray-600">
                        {appt.chiefComplaint || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appt.status)}>
                        {appt.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/schedule/appointments/${appt.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {appt.status === 'SCHEDULED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED') && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'CHECKED_IN')}>
                                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'CANCELLED')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          {appt.status === 'CHECKED_IN' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/clinical/encounter/new?appointmentId=${appt.id}`}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Start Encounter
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogDescription>View appointment information</DialogDescription>
              </div>
              {selectedAppointment && (
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {selectedAppointment.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <p className="font-medium">{format(parseISO(selectedAppointment.scheduledStart), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <p className="font-medium">
                      {format(parseISO(selectedAppointment.scheduledStart), 'h:mm a')} - {format(parseISO(selectedAppointment.scheduledEnd), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Appointment Type</p>
                  <p className="font-medium mt-1">{selectedAppointment.type.name}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.type.duration} minutes</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Patient</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}</p>
                    <p className="text-sm text-gray-500">MRN: {selectedAppointment.patient.mrn}</p>
                  </div>
                </div>
                {selectedAppointment.patient.phone && (
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{selectedAppointment.patient.phone}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Provider</p>
                <p className="font-medium">Dr. {selectedAppointment.provider.user.firstName} {selectedAppointment.provider.user.lastName}</p>
                {selectedAppointment.location && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{selectedAppointment.location.name}</p>
                  </div>
                )}
              </div>

              {selectedAppointment.chiefComplaint && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Chief Complaint</p>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm">{selectedAppointment.chiefComplaint}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                  <Link href={`/dashboard/schedule/appointments/${selectedAppointment.id}`}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
