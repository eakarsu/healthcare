'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Receipt,
  FileText,
  Brain,
  Settings,
  Shield,
  Building2,
  CreditCard,
  ClipboardList,
  BarChart3,
  Mic,
  Calculator,
  AlertTriangle,
  ShieldCheck,
  Activity,
  CalendarX,
  Lightbulb,
  Pill,
  Send,
  FlaskConical,
  FolderLock,
  Phone,
  Target,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
  },
  {
    name: 'Schedule',
    href: '/dashboard/schedule',
    icon: Calendar,
    children: [
      { name: 'Calendar', href: '/dashboard/schedule' },
      { name: 'Appointments', href: '/dashboard/schedule/appointments' },
      { name: 'Waitlist', href: '/dashboard/schedule/waitlist' },
    ],
  },
  {
    name: 'Clinical',
    href: '/dashboard/clinical',
    icon: Stethoscope,
    children: [
      { name: "Today's Patients", href: '/dashboard/clinical' },
      { name: 'Lab Orders', href: '/dashboard/clinical/lab-orders' },
      { name: 'Templates', href: '/dashboard/clinical/templates' },
    ],
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: Receipt,
    children: [
      { name: 'Overview', href: '/dashboard/billing' },
      { name: 'Claims', href: '/dashboard/billing/claims' },
      { name: 'Payments', href: '/dashboard/billing/payments' },
      { name: 'Superbills', href: '/dashboard/billing/superbill' },
      { name: 'Aging Report', href: '/dashboard/billing/aging' },
      { name: 'Denials', href: '/dashboard/billing/denials' },
      { name: 'Eligibility', href: '/dashboard/billing/eligibility' },
    ],
  },
  {
    name: 'Insurance',
    href: '/dashboard/insurance',
    icon: FileText,
    children: [
      { name: 'Plans', href: '/dashboard/insurance' },
      { name: 'Verification', href: '/dashboard/insurance/verification' },
    ],
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FolderLock,
  },
  {
    name: 'Allergy Review',
    href: '/dashboard/allergy-interaction-review',
    icon: AlertTriangle,
  },
  {
    name: 'Fax',
    href: '/dashboard/fax',
    icon: Phone,
  },
  {
    name: 'Quality & MIPS',
    href: '/dashboard/quality',
    icon: Target,
  },
  {
    name: 'AI Features',
    href: '/dashboard/ai',
    icon: Brain,
    children: [
      { name: 'Medical Scribe', href: '/dashboard/ai/scribe' },
    ],
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/dashboard/settings' },
      { name: 'Providers', href: '/dashboard/settings/providers' },
      { name: 'Locations', href: '/dashboard/settings/locations' },
      { name: 'Services', href: '/dashboard/settings/services' },
      { name: 'Fee Schedules', href: '/dashboard/settings/fee-schedules' },
      { name: 'Security', href: '/dashboard/settings/security' },
      { name: 'HIPAA', href: '/dashboard/settings/hipaa' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">PracticeFlux</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>

                {item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                          pathname === child.href
                            ? 'font-medium text-teal-700'
                            : 'text-gray-500 hover:text-gray-900'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
          <Building2 className="h-5 w-5 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">Mountain View Medical</p>
            <p className="truncate text-xs text-gray-500">Main Office</p>
          </div>
        </div>
      </div>
    </div>
  )
}
