'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import {
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  User,
  Calendar,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'

interface WaitlistEntry {
  id: string
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    phone: string
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  } | null
  appointmentType: {
    id: string
    name: string
    duration: number
  }
  preferredDays: string[]
  preferredTimeStart: string | null
  preferredTimeEnd: string | null
  reason: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'WAITING' | 'CONTACTED' | 'SCHEDULED' | 'CANCELLED'
  notes: string | null
  createdAt: string
  updatedAt: string
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
}

export default function WaitlistPage() {
  const { toast } = useToast()
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('WAITING')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [formProvider, setFormProvider] = useState('')
  const [formType, setFormType] = useState('')
  const [formPriority, setFormPriority] = useState('NORMAL')
  const [formReason, setFormReason] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [preferredDays, setPreferredDays] = useState<string[]>([])

  useEffect(() => {
    fetchWaitlist()
    fetchProviders()
    fetchAppointmentTypes()
    fetchAllPatients()
  }, [statusFilter, priorityFilter])

  const fetchWaitlist = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (priorityFilter !== 'all') {
        params.set('priority', priorityFilter)
      }

      const response = await fetch(`/api/waitlist?${params}`)
      const data = await response.json()
      setWaitlist(data.data || [])
    } catch (error) {
      console.error('Failed to fetch waitlist:', error)
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

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch('/api/appointment-types')
      const data = await response.json()
      setAppointmentTypes(data.data || [])
    } catch (error) {
      console.error('Failed to fetch appointment types:', error)
    }
  }

  const fetchAllPatients = async () => {
    try {
      const response = await fetch('/api/patients?limit=100')
      const data = await response.json()
      setPatients(data.data || [])
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const handleAddToWaitlist = async () => {
    if (!selectedPatient || !formType || !formReason) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          providerId: formProvider && formProvider !== 'any' ? formProvider : undefined,
          appointmentTypeId: formType,
          priority: formPriority,
          reason: formReason,
          notes: formNotes || undefined,
          preferredDays: preferredDays,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Added to waitlist',
          description: 'Patient has been added to the waitlist',
        })
        setIsDialogOpen(false)
        resetForm()
        fetchWaitlist()
      } else {
        throw new Error('Failed to add to waitlist')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add patient to waitlist',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: 'Status updated',
          description: `Waitlist entry marked as ${status.toLowerCase()}`,
        })
        fetchWaitlist()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setSelectedPatient(null)
    setFormProvider('')
    setFormType('')
    setFormPriority('NORMAL')
    setFormReason('')
    setFormNotes('')
    setPreferredDays([])
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case 'NORMAL':
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
      case 'LOW':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>
      case 'CONTACTED':
        return <Badge className="bg-blue-100 text-blue-800">Contacted</Badge>
      case 'SCHEDULED':
        return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredWaitlist = waitlist.filter((entry) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      entry.patient.firstName.toLowerCase().includes(searchLower) ||
      entry.patient.lastName.toLowerCase().includes(searchLower) ||
      entry.patient.mrn.toLowerCase().includes(searchLower)
    )
  })

  const stats = {
    total: waitlist.length,
    urgent: waitlist.filter((e) => e.priority === 'URGENT').length,
    highPriority: waitlist.filter((e) => e.priority === 'HIGH').length,
    waiting: waitlist.filter((e) => e.status === 'WAITING').length,
  }

  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter((d) => d !== day))
    } else {
      setPreferredDays([...preferredDays, day])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
          <p className="text-gray-500">Manage patients waiting for appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              Add to Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Patient to Waitlist</DialogTitle>
              <DialogDescription>Search and add a patient to the appointment waitlist</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <Select
                  value={selectedPatient?.id || ''}
                  onValueChange={(value) => {
                    const patient = patients.find((p) => p.id === value)
                    setSelectedPatient(patient || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.lastName}, {patient.firstName} (MRN: {patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
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
                <Label>Preferred Provider</Label>
                <Select value={formProvider} onValueChange={setFormProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Provider</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        Dr. {provider.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formPriority} onValueChange={setFormPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Days</Label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={preferredDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit *</Label>
                <Textarea
                  placeholder="Describe reason for appointment..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddToWaitlist} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                  Add to Waitlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Waiting</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.urgent > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Urgent</p>
                <p className={`text-2xl font-bold ${stats.urgent > 0 ? 'text-red-600' : ''}`}>
                  {stats.urgent}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${stats.urgent > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highPriority}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actively Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
              </div>
              <User className="h-8 w-8 text-yellow-400" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="WAITING">Waiting</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredWaitlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No patients on waitlist</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Appointment Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaitlist.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <TableCell>
                      <Link href={`/dashboard/patients/${entry.patient.id}`} className="hover:underline">
                        <p className="font-medium">
                          {entry.patient.lastName}, {entry.patient.firstName}
                        </p>
                        <p className="text-xs text-gray-500">MRN: {entry.patient.mrn}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.patient.phone}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p>{entry.appointmentType.name}</p>
                      <p className="text-xs text-gray-500">{entry.appointmentType.duration} min</p>
                    </TableCell>
                    <TableCell>
                      {entry.provider
                        ? `Dr. ${entry.provider.user.lastName}`
                        : 'Any Provider'
                      }
                    </TableCell>
                    <TableCell>{getPriorityBadge(entry.priority)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {differenceInDays(new Date(), parseISO(entry.createdAt))} days
                        </p>
                        <p className="text-xs text-gray-500">
                          Added: {format(parseISO(entry.createdAt), 'MMM d')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/schedule/appointments/new?patientId=${entry.patient.id}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Appointment
                            </Link>
                          </DropdownMenuItem>
                          {entry.status === 'WAITING' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(entry.id, 'CONTACTED')}>
                              <Phone className="mr-2 h-4 w-4 text-blue-600" />
                              Mark as Contacted
                            </DropdownMenuItem>
                          )}
                          {entry.status !== 'SCHEDULED' && entry.status !== 'CANCELLED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(entry.id, 'CANCELLED')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Remove from Waitlist
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

      {/* Waitlist Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Waitlist Details</DialogTitle>
                <DialogDescription>View waitlist entry information</DialogDescription>
              </div>
              {selectedEntry && getPriorityBadge(selectedEntry.priority)}
            </div>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Patient</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedEntry.patient.firstName} {selectedEntry.patient.lastName}</p>
                    <p className="text-sm text-gray-500">MRN: {selectedEntry.patient.mrn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{selectedEntry.patient.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Appointment Type</p>
                  <p className="font-medium mt-1">{selectedEntry.appointmentType.name}</p>
                  <p className="text-sm text-gray-500">{selectedEntry.appointmentType.duration} minutes</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="font-medium mt-1">
                    {selectedEntry.provider ? `Dr. ${selectedEntry.provider.user.lastName}` : 'Any Provider'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                <p className="text-sm">{selectedEntry.reason}</p>
              </div>

              {selectedEntry.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedEntry.notes}</p>
                </div>
              )}

              {selectedEntry.preferredDays.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Preferred Days</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.preferredDays.map((day) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Wait Time</p>
                  <p className="font-medium mt-1">{differenceInDays(new Date(), parseISO(selectedEntry.createdAt))} days</p>
                  <p className="text-sm text-gray-500">Since {format(parseISO(selectedEntry.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                  <Link href={`/dashboard/schedule/appointments/new?patientId=${selectedEntry.patient.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Appointment
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
