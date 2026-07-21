'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardGridSkeleton, Skeleton } from '@/components/ui/loading-skeleton'
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Shield,
  Brain,
  Settings,
  CreditCard,
  BarChart3,
  Mail,
  FileBarChart,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    name: "Today's Appointments",
    value: '12',
    change: '+2',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    link: '/dashboard/schedule',
  },
  {
    name: 'Patients Checked In',
    value: '5',
    subtext: 'of 12 scheduled',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    link: '/dashboard/patients',
  },
  {
    name: 'Revenue Today',
    value: '$2,450',
    change: '+15%',
    icon: DollarSign,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    link: '/dashboard/billing/payments',
  },
  {
    name: 'Pending Claims',
    value: '8',
    subtext: '$12,340 total',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    link: '/dashboard/billing/claims',
  },
]

const upcomingAppointments = [
  { id: '1', patient: 'John Smith', time: '9:00 AM', type: 'Follow-up', provider: 'Dr. Wilson', status: 'CHECKED_IN' },
  { id: '2', patient: 'Sarah Johnson', time: '9:30 AM', type: 'New Patient', provider: 'Dr. Chen', status: 'CONFIRMED' },
  { id: '3', patient: 'Michael Brown', time: '10:00 AM', type: 'Sick Visit', provider: 'Dr. Wilson', status: 'SCHEDULED' },
  { id: '4', patient: 'Emily Davis', time: '10:30 AM', type: 'Annual Physical', provider: 'Dr. Chen', status: 'SCHEDULED' },
]

const alerts = [
  { id: '1', type: 'warning', message: '3 claims denied - require attention', link: '/dashboard/billing/claims' },
  { id: '2', type: 'info', message: '5 patients due for recall this week', link: '/dashboard/patients' },
  { id: '3', type: 'success', message: 'ERA received - $8,450 ready to post', link: '/dashboard/billing/payments' },
]

const moduleCards = [
  { name: 'Patients', description: 'Manage patient records', icon: Users, link: '/dashboard/patients', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'Schedule', description: 'Appointments & calendar', icon: Calendar, link: '/dashboard/schedule', color: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'Clinical', description: 'Encounters & charting', icon: Stethoscope, link: '/dashboard/clinical', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: 'Billing', description: 'Claims & payments', icon: CreditCard, link: '/dashboard/billing', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: 'Insurance', description: 'Plans & eligibility', icon: Shield, link: '/dashboard/insurance', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { name: 'AI Features', description: 'Scribe & predictions', icon: Brain, link: '/dashboard/ai', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { name: 'Documents', description: 'Files & faxes', icon: FileBarChart, link: '/dashboard/documents', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { name: 'Reports', description: 'Analytics & quality', icon: BarChart3, link: '/dashboard/reports', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { name: 'Fax', description: 'Send & receive faxes', icon: Mail, link: '/dashboard/fax', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { name: 'Quality', description: 'MIPS & measures', icon: CheckCircle2, link: '/dashboard/quality', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { name: 'Settings', description: 'Practice configuration', icon: Settings, link: '/dashboard/settings', color: 'text-slate-600', bgColor: 'bg-slate-100' },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleCardClick = (link: string) => {
    router.push(link)
  }

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <CardGridSkeleton count={4} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <div className="rounded-lg border bg-white p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {session?.user?.firstName}
          </h1>
          <p className="text-gray-500">
            Here&apos;s what&apos;s happening at the practice today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleCardClick('/dashboard/schedule')}>
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" onClick={() => handleCardClick('/dashboard/patients/new')}>
            <Users className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Stats Grid - Clickable Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.name}
              className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200"
              onClick={() => handleCardClick(stat.link)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="text-green-600">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Next patients in queue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleCardClick('/dashboard/schedule')}>
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => handleCardClick(`/dashboard/schedule/appointments/${appt.id}`)}
                  className="flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors hover:bg-gray-50 hover:border-teal-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{appt.patient}</p>
                      <p className="text-sm text-gray-500">
                        {appt.time} &bull; {appt.type} &bull; {appt.provider}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      appt.status === 'CHECKED_IN'
                        ? 'success'
                        : appt.status === 'CONFIRMED'
                        ? 'info'
                        : 'secondary'
                    }
                  >
                    {appt.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleCardClick(alert.link)}
                  className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-gray-50"
                >
                  {alert.type === 'warning' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                  {alert.type === 'info' && <Clock className="h-5 w-5 text-blue-500" />}
                  {alert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  <p className="flex-1 text-sm">{alert.message}</p>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => handleCardClick('/dashboard/ai/scribe')}>
                Start AI Scribe
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleCardClick('/dashboard/billing/eligibility')}>
                Check Eligibility
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards - Navigate to appropriate menu */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {moduleCards.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.name}
                className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200"
                onClick={() => handleCardClick(module.link)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`rounded-lg p-3 ${module.bgColor} mb-3`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <p className="font-medium text-sm">{module.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200"
          onClick={() => handleCardClick('/dashboard/billing/payments')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Collections This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$18,250</p>
            <p className="text-xs text-green-600">+12% from last week</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200"
          onClick={() => handleCardClick('/dashboard/billing/claims')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">AR Over 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$4,320</p>
            <p className="text-xs text-orange-600">5 claims need follow-up</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200"
          onClick={() => handleCardClick('/dashboard/schedule')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">No-Show Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.2%</p>
            <p className="text-xs text-green-600">Below 5% target</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
