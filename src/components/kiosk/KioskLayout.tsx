'use client'

import { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

interface KioskLayoutProps {
  children: ReactNode
  step?: number
  totalSteps?: number
  title?: string
}

export function KioskLayout({ children, step, totalSteps = 4, title }: KioskLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Patient Check-In</h1>
              <p className="text-sm text-gray-500">Welcome to our practice</p>
            </div>
          </div>
          {step && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full ${
                      i < step ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Title */}
      {title && (
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500">
          Need help? Please ask a staff member for assistance.
        </div>
      </footer>
    </div>
  )
}
