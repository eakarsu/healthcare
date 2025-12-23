'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Clock,
  Bell,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface UpcomingAppointment {
  id: string
  date: string
  time: string
  provider: string
  type: string
  location: string
}

interface Message {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  unread: boolean
}

export default function PortalDashboard() {
  const [loading, setLoading] = useState(true)

  // Mock data
  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: '1',
      date: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      time: '10:00 AM',
      provider: 'Dr. Sarah Wilson',
      type: 'Follow-up Visit',
      location: 'Main Office',
    },
    {
      id: '2',
      date: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      time: '2:30 PM',
      provider: 'Dr. Michael Chen',
      type: 'Annual Physical',
      location: 'Main Office',
    },
  ]

  const recentMessages: Message[] = [
    {
      id: '1',
      from: 'Dr. Sarah Wilson',
      subject: 'Lab Results Available',
      preview: 'Your recent lab results are now available for review...',
      date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'MMM d'),
      unread: true,
    },
    {
      id: '2',
      from: 'Front Desk',
      subject: 'Appointment Reminder',
      preview: 'This is a reminder for your upcoming appointment on...',
      date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'MMM d'),
      unread: false,
    },
  ]

  const accountBalance = 125.50
  const unreadMessages = 1

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
        <p className="text-gray-500">Here&apos;s an overview of your health information</p>
      </div>

      {/* Alert Banner */}
      {accountBalance > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Outstanding Balance</p>
              <p className="text-sm text-yellow-700">
                You have a balance of {formatCurrency(accountBalance)} due.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/portal/payments">Pay Now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/portal/appointments">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-teal-100 p-3 mb-3">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
              <p className="font-medium">Schedule Appointment</p>
              <p className="text-sm text-gray-500">Book a new visit</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/messages">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors">
            <CardContent className="pt-6 flex flex-col items-center text-center relative">
              <div className="rounded-full bg-blue-100 p-3 mb-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              {unreadMessages > 0 && (
                <Badge className="absolute top-4 right-4 bg-red-500">{unreadMessages}</Badge>
              )}
              <p className="font-medium">Messages</p>
              <p className="text-sm text-gray-500">Contact your care team</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/records">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-purple-100 p-3 mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium">Medical Records</p>
              <p className="text-sm text-gray-500">View your health info</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/payments">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 p-3 mb-3">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium">Pay Bill</p>
              <p className="text-sm text-gray-500">Make a payment</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Upcoming Appointments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal/appointments">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No upcoming appointments</p>
                <Button className="mt-4" asChild>
                  <Link href="/portal/appointments">Schedule Now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-teal-50 text-teal-700">
                      <span className="text-lg font-bold">
                        {format(new Date(appt.date), 'd')}
                      </span>
                      <span className="text-xs">
                        {format(new Date(appt.date), 'MMM')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{appt.type}</p>
                      <p className="text-sm text-gray-500">{appt.provider}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {appt.time} • {appt.location}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Recent Messages
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal/messages">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href={`/portal/messages/${msg.id}`}
                    className={`block p-4 rounded-lg border hover:bg-gray-50 ${
                      msg.unread ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${msg.unread ? 'text-blue-900' : ''}`}>
                            {msg.from}
                          </p>
                          {msg.unread && (
                            <Badge className="bg-blue-500 text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-1">{msg.subject}</p>
                        <p className="text-sm text-gray-500 truncate mt-1">{msg.preview}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-4">{msg.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            Health Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Annual Physical</p>
                <p className="text-sm text-green-700">Completed Aug 15, 2024</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Flu Shot</p>
                <p className="text-sm text-yellow-700">Due this season</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Lab Work</p>
                <p className="text-sm text-blue-700">Due in 3 months</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
