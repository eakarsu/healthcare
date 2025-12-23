'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import { getStatusColor } from '@/lib/utils'

interface Appointment {
  id: string
  scheduledStart: string
  scheduledEnd: string
  status: string
  chiefComplaint: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
  }
  provider: {
    id: string
    color: string | null
    user: {
      firstName: string
      lastName: string
    }
  }
  type: {
    name: string
    color: string | null
    duration: number
  }
}

interface Provider {
  id: string
  color: string | null
  user: {
    firstName: string
    lastName: string
  }
}

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week'>('week')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    fetchAppointments()
    fetchProviders()
  }, [currentDate, selectedProvider])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      })
      if (selectedProvider !== 'all') {
        params.set('providerId', selectedProvider)
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

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    return appointments.filter((appt) => {
      const apptDate = parseISO(appt.scheduledStart)
      const apptTime = format(apptDate, 'HH:mm')
      return isSameDay(apptDate, day) && apptTime === time
    })
  }

  const goToToday = () => setCurrentDate(new Date())
  const goToPrev = () => setCurrentDate(addDays(currentDate, view === 'week' ? -7 : -1))
  const goToNext = () => setCurrentDate(addDays(currentDate, view === 'week' ? 7 : 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500">
            {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Providers" />
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
          <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
            <Link href="/dashboard/schedule/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-20 border-b border-r bg-gray-50 p-2 text-xs font-medium text-gray-500">
                      Time
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day.toISOString()}
                        className={`min-w-[150px] border-b border-r p-2 text-center ${
                          isSameDay(day, new Date()) ? 'bg-teal-50' : 'bg-gray-50'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-500">
                          {format(day, 'EEE')}
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isSameDay(day, new Date())
                              ? 'text-teal-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {format(day, 'd')}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time}>
                      <td className="border-b border-r bg-gray-50 p-2 text-center text-xs text-gray-500">
                        {time}
                      </td>
                      {weekDays.map((day) => {
                        const dayAppointments = getAppointmentsForDayAndTime(day, time)
                        return (
                          <td
                            key={`${day.toISOString()}-${time}`}
                            className="border-b border-r p-1 align-top"
                          >
                            {dayAppointments.map((appt) => (
                              <Link
                                key={appt.id}
                                href={`/dashboard/schedule/appointments/${appt.id}`}
                                className="mb-1 block rounded p-2 text-xs hover:opacity-80"
                                style={{
                                  backgroundColor: appt.type.color || appt.provider.color || '#e2e8f0',
                                }}
                              >
                                <div className="flex items-center gap-1 font-medium">
                                  <Clock className="h-3 w-3" />
                                  {format(parseISO(appt.scheduledStart), 'h:mm a')}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  {appt.patient.lastName}, {appt.patient.firstName}
                                </div>
                                <div className="mt-1 text-gray-600">
                                  {appt.type.name}
                                </div>
                                <Badge
                                  className={`mt-1 text-[10px] ${getStatusColor(appt.status)}`}
                                >
                                  {appt.status}
                                </Badge>
                              </Link>
                            ))}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
