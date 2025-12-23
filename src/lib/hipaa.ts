// HIPAA Compliance Utilities

// Check session timeout (15 minutes)
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export function isSessionExpired(lastActivity: Date | null): boolean {
  if (!lastActivity) return true
  const now = new Date()
  const diff = now.getTime() - lastActivity.getTime()
  return diff > SESSION_TIMEOUT_MS
}

// Minimum password requirements for HIPAA
export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Role-based access control
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'], // Full access
  MANAGER: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
    'encounters:read',
    'encounters:write',
    'claims:read',
    'claims:write',
    'reports:read',
    'users:read',
  ],
  PROVIDER: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
    'encounters:read',
    'encounters:write',
    'claims:read',
    'ai:use',
  ],
  NURSE: [
    'patients:read',
    'appointments:read',
    'appointments:write',
    'encounters:read',
    'encounters:write',
  ],
  RECEPTIONIST: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
  ],
  BILLER: [
    'patients:read',
    'claims:read',
    'claims:write',
    'payments:read',
    'payments:write',
    'reports:read',
  ],
}

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  if (permissions.includes('*')) return true

  // Check for exact match or wildcard
  const [resource, action] = permission.split(':')
  return (
    permissions.includes(permission) ||
    permissions.includes(`${resource}:*`) ||
    permissions.includes('*:' + action)
  )
}

// PHI fields that need special handling
export const PHI_FIELDS = [
  'ssn',
  'dateOfBirth',
  'address',
  'phone',
  'mobile',
  'email',
  'emergencyName',
  'emergencyPhone',
]

// Redact PHI from data for logging
export function redactPHI<T extends Record<string, unknown>>(data: T): T {
  const redacted = { ...data }
  for (const field of PHI_FIELDS) {
    if (field in redacted && redacted[field]) {
      redacted[field as keyof T] = '[REDACTED]' as T[keyof T]
    }
  }
  return redacted
}

// Generate secure random string for tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}
