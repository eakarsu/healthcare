'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
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
  Trash2,
  Edit,
  RefreshCw,
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
    user: { firstName: string; lastName: string }
  }
  type: { name: string; duration: number }
  location: { name: string } | null
}

interface Provider {
  id: string
  user: { firstName: string; lastName: string }
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

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false)
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Single cancel
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchProviders()
  }, [statusFilter, providerFilter, dateFilter])

  const getDateRange = () => {
    const today = new Date()
    switch (dateFilter) {
      case 'today': return { start: startOfDay(today), end: endOfDay(today) }
      case 'tomorrow': return { start: startOfDay(addDays(today, 1)), end: endOfDay(addDays(today, 1)) }
      case 'week': return { start: startOfDay(today), end: endOfDay(addDays(today, 7)) }
      case 'month': return { start: startOfDay(today), end: endOfDay(addDays(today, 30)) }
      default: return { start: startOfDay(today), end: endOfDay(today) }
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
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (providerFilter !== 'all') params.set('providerId', providerFilter)

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
        toast({ title: 'Status updated', description: `Appointment marked as ${newStatus}` })
        fetchAppointments()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update appointment status', variant: 'destructive' })
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAppointments.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredAppointments.map(a => a.id)))
  }

  const handleBulkCancel = async () => {
    setBulkLoading(true)
    try {
      const response = await fetch('/api/appointments/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        fetchAppointments()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel appointments', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkCancelOpen(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkUpdateStatus) return
    setBulkLoading(true)
    try {
      const response = await fetch('/api/appointments/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        setBulkUpdateStatus('')
        fetchAppointments()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update appointments', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkUpdateOpen(false)
    }
  }

  const handleSingleCancel = async () => {
    if (!cancelTarget) return
    setCancelLoading(true)
    try {
      const response = await fetch(`/api/appointments/${cancelTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Appointment cancelled' })
        setCancelTarget(null)
        setSelectedAppointment(null)
        fetchAppointments()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel appointment', variant: 'destructive' })
    } finally {
      setCancelLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((appt) => {
    if (!search) return true
    const s = search.toLowerCase()
    return appt.patient.firstName.toLowerCase().includes(s) ||
      appt.patient.lastName.toLowerCase().includes(s) ||
      appt.patient.mrn.toLowerCase().includes(s)
  })

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    checkedIn: appointments.filter(a => a.status === 'CHECKED_IN').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
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
        {[
          { label: 'Total', value: stats.total, color: '' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-600' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600' },
          { label: 'Checked In', value: stats.checkedIn, color: 'text-yellow-600' },
          { label: 'Completed', value: stats.completed, color: 'text-gray-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>Dr. {p.user.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-teal-50 border border-teal-200 p-3">
              <span className="text-sm font-medium text-teal-800">
                {selectedIds.size} appointment{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setBulkUpdateOpen(true)}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Bulk Update
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setBulkCancelOpen(true)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Cancel Selected
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={8} columns={7} />
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
                  <TableHead className="w-[40px] pl-4">
                    <Checkbox
                      checked={selectedIds.size === filteredAppointments.length && filteredAppointments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
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
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(appt.id)}
                        onCheckedChange={() => toggleSelect(appt.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{format(parseISO(appt.scheduledStart), 'h:mm a')}</p>
                        <p className="text-xs text-gray-500">{getDateLabel(appt.scheduledStart)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{appt.patient.lastName}, {appt.patient.firstName}</p>
                      <p className="text-xs text-gray-500">MRN: {appt.patient.mrn}</p>
                    </TableCell>
                    <TableCell>Dr. {appt.provider.user.lastName}</TableCell>
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
                            <Link href={`/dashboard/schedule/appointments/${appt.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {appt.status === 'SCHEDULED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {(['SCHEDULED', 'CONFIRMED'].includes(appt.status)) && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'CHECKED_IN')}>
                                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCancelTarget(appt)}>
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

      {/* Appointment Detail Dialog with Edit/Delete */}
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

              <div className="flex justify-between gap-3 pt-4 border-t">
                {!['COMPLETED', 'CANCELLED'].includes(selectedAppointment.status) && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setCancelTarget(selectedAppointment)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/schedule/appointments/${selectedAppointment.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                    <Link href={`/dashboard/schedule/appointments/${selectedAppointment.id}`}>
                      View Full Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Cancel Confirmation */}
      <ConfirmationDialog
        open={bulkCancelOpen}
        onOpenChange={setBulkCancelOpen}
        title="Cancel Selected Appointments"
        description={`Are you sure you want to cancel ${selectedIds.size} appointment${selectedIds.size > 1 ? 's' : ''}?`}
        confirmLabel="Cancel All"
        variant="danger"
        loading={bulkLoading}
        onConfirm={handleBulkCancel}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update Appointments</DialogTitle>
            <DialogDescription>
              Update status for {selectedIds.size} selected appointment{selectedIds.size > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkUpdateOpen(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleBulkUpdate} disabled={!bulkUpdateStatus || bulkLoading}>
                {bulkLoading ? 'Updating...' : 'Update All'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Cancel Confirmation */}
      <ConfirmationDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel the appointment for ${cancelTarget?.patient.firstName} ${cancelTarget?.patient.lastName}?`}
        confirmLabel="Cancel Appointment"
        variant="warning"
        loading={cancelLoading}
        onConfirm={handleSingleCancel}
      />
    </div>
  )
}
