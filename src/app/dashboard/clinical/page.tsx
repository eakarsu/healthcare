'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Stethoscope,
  Clock,
  User,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { formatDate, getStatusColor } from '@/lib/utils'

interface TodayPatient {
  id: string
  scheduledStart: string
  status: string
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
  encounter?: {
    id: string
    status: string
  } | null
}

export default function ClinicalPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<TodayPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const handleRowClick = (appt: TodayPatient) => {
    // If there's an encounter, go to it; otherwise go to patient details
    if (appt.encounter) {
      router.push(`/dashboard/clinical/encounter/${appt.encounter.id}`)
    } else {
      router.push(`/dashboard/patients/${appt.patient.id}`)
    }
  }

  useEffect(() => {
    fetchTodayPatients()
  }, [])

  const fetchTodayPatients = async () => {
    setLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const params = new URLSearchParams({
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      })

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()
      setAppointments(data.data || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true
    if (filter === 'waiting') return appt.status === 'CHECKED_IN' && !appt.encounter
    if (filter === 'in_progress') return appt.encounter?.status === 'IN_PROGRESS'
    if (filter === 'completed') return appt.encounter?.status === 'SIGNED'
    return true
  })

  const stats = {
    total: appointments.length,
    waiting: appointments.filter((a) => a.status === 'CHECKED_IN' && !a.encounter).length,
    inProgress: appointments.filter((a) => a.encounter?.status === 'IN_PROGRESS').length,
    completed: appointments.filter((a) => a.encounter?.status === 'SIGNED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical</h1>
          <p className="text-gray-500">Today&apos;s patients - {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
          <Link href="/dashboard/clinical/templates">
            <FileText className="mr-2 h-4 w-4" />
            Note Templates
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-teal-500" onClick={() => setFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Scheduled</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter('waiting')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                <p className="text-sm text-gray-500">Waiting</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500" onClick={() => setFilter('in_progress')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter('completed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Queue</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Stethoscope className="mb-4 h-12 w-12 text-gray-300" />
              <p>No patients in this category</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow
                    key={appt.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(appt)}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(appt.scheduledStart), 'h:mm a')}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/patients/${appt.patient.id}`}
                        className="font-medium hover:text-teal-600"
                      >
                        {appt.patient.lastName}, {appt.patient.firstName}
                      </Link>
                      <p className="text-sm text-gray-500">{appt.patient.mrn}</p>
                    </TableCell>
                    <TableCell>{appt.type.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {appt.chiefComplaint || '-'}
                    </TableCell>
                    <TableCell>
                      Dr. {appt.provider.user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appt.encounter?.status || appt.status)}>
                        {appt.encounter?.status || appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {appt.encounter ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/clinical/encounter/${appt.encounter.id}`}>
                            Continue
                          </Link>
                        </Button>
                      ) : appt.status === 'CHECKED_IN' ? (
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                          <Link href={`/dashboard/clinical/encounter/new?appointmentId=${appt.id}`}>
                            Start Encounter
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          Not Checked In
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
