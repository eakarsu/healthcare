'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Building2,
  Stethoscope,
  DollarSign,
  Shield,
  Bell,
  Lock,
  Palette,
  Database,
  FileText,
} from 'lucide-react'

const settingsGroups = [
  {
    title: 'Practice',
    description: 'Configure your practice settings',
    items: [
      {
        title: 'Providers',
        description: 'Manage providers and their schedules',
        href: '/settings/providers',
        icon: Stethoscope,
      },
      {
        title: 'Locations',
        description: 'Practice locations and rooms',
        href: '/settings/locations',
        icon: Building2,
      },
      {
        title: 'Users',
        description: 'Staff accounts and permissions',
        href: '/settings/users',
        icon: Users,
      },
    ],
  },
  {
    title: 'Billing',
    description: 'Financial and billing configuration',
    items: [
      {
        title: 'Services & CPT Codes',
        description: 'Medical services and procedure codes',
        href: '/settings/services',
        icon: FileText,
      },
      {
        title: 'Fee Schedules',
        description: 'Pricing for services and payers',
        href: '/settings/fee-schedules',
        icon: DollarSign,
      },
    ],
  },
  {
    title: 'Security & Compliance',
    description: 'HIPAA compliance and security settings',
    items: [
      {
        title: 'HIPAA Compliance',
        description: 'Audit logs and compliance settings',
        href: '/settings/hipaa',
        icon: Shield,
      },
      {
        title: 'Security',
        description: 'Password policies and 2FA',
        href: '/settings/security',
        icon: Lock,
      },
    ],
  },
  {
    title: 'System',
    description: 'Application preferences',
    items: [
      {
        title: 'Notifications',
        description: 'Email and alert preferences',
        href: '/settings/notifications',
        icon: Bell,
      },
      {
        title: 'Appearance',
        description: 'Theme and display options',
        href: '/settings/appearance',
        icon: Palette,
      },
      {
        title: 'Data Management',
        description: 'Import, export, and backups',
        href: '/settings/data',
        icon: Database,
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your practice configuration</p>
      </div>

      <div className="space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full cursor-pointer transition-all hover:border-teal-500 hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-teal-100 p-2">
                          <item.icon className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
