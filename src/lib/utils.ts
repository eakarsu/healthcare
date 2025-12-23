import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInYears } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy h:mm a')
}

export function formatTime(date: Date | string): string {
  return formatDate(date, 'h:mm a')
}

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth
  return differenceInYears(new Date(), dob)
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export function generateMRN(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MRN-${timestamp}-${random}`
}

export function generateClaimNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CLM-${date}-${random}`
}

export function generateEncounterNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ENC-${date}-${random}`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatPatientName(
  firstName: string,
  lastName: string,
  middleName?: string | null,
  preferredName?: string | null
): string {
  let name = lastName + ', ' + firstName
  if (middleName) name += ' ' + middleName
  if (preferredName) name += ` "${preferredName}"`
  return name
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Appointment statuses
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-orange-100 text-orange-800',
    RESCHEDULED: 'bg-cyan-100 text-cyan-800',
    // Claim statuses
    CREATED: 'bg-gray-100 text-gray-800',
    VALIDATED: 'bg-blue-100 text-blue-800',
    SUBMITTED: 'bg-indigo-100 text-indigo-800',
    ACKNOWLEDGED: 'bg-cyan-100 text-cyan-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-lime-100 text-lime-800',
    DENIED: 'bg-red-100 text-red-800',
    APPEALED: 'bg-orange-100 text-orange-800',
    VOID: 'bg-slate-100 text-slate-800',
    // Encounter statuses
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    SIGNED: 'bg-green-100 text-green-800',
    LOCKED: 'bg-gray-100 text-gray-800',
    AMENDED: 'bg-purple-100 text-purple-800',
    // Patient statuses
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    DECEASED: 'bg-slate-100 text-slate-800',
    TRANSFERRED: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    MILD: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    SEVERE: 'bg-orange-100 text-orange-800',
    LIFE_THREATENING: 'bg-red-100 text-red-800',
  }
  return colors[severity] || 'bg-gray-100 text-gray-800'
}

// Pagination helper
export function getPaginationParams(request: Request): {
  page: number
  limit: number
  skip: number
} {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// API response helpers
export function apiResponse<T>(data: T, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function apiError(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
