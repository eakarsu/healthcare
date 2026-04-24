import { prisma } from './prisma'

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'VERIFY' | 'VIEW' | 'USER_CREATED' | 'BULK_DELETE' | 'BULK_UPDATE' | 'BULK_CANCEL' | 'BULK_VOID' | 'PASSWORD_CHANGED' | 'PASSWORD_RESET' | 'EMAIL_VERIFIED' | 'ENABLE_2FA'

export interface AuditLogParams {
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  patientId?: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  phiAccessed?: boolean
}

export async function createAuditLog(params: AuditLogParams) {
  const {
    userId,
    action,
    entity,
    entityId,
    patientId,
    changes,
    ipAddress,
    userAgent,
    phiAccessed = false,
  } = params

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        patientId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ipAddress,
        userAgent,
        phiAccessed,
      },
    })
  } catch (error) {
    // Log to console but don't throw - audit logging should not break app
    console.error('Failed to create audit log:', error)
  }
}

// Helper to get changes between old and new data
export function getChanges<T extends Record<string, unknown>>(
  oldData: T,
  newData: T,
  sensitiveFields: string[] = []
): { before: Partial<T>; after: Partial<T> } | null {
  const before: Partial<T> = {}
  const after: Partial<T> = {}

  for (const key of Object.keys(newData) as (keyof T)[]) {
    if (oldData[key] !== newData[key]) {
      if (sensitiveFields.includes(key as string)) {
        before[key] = '[REDACTED]' as T[keyof T]
        after[key] = '[REDACTED]' as T[keyof T]
      } else {
        before[key] = oldData[key]
        after[key] = newData[key]
      }
    }
  }

  if (Object.keys(before).length === 0) {
    return null
  }

  return { before, after }
}

// Helper to extract request info
export function extractRequestInfo(request: Request): {
  ipAddress: string | undefined
  userAgent: string | undefined
} {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    undefined

  const userAgent = request.headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

// Get audit logs for a specific patient
export async function getPatientAuditLogs(
  patientId: string,
  options: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const { limit = 100, offset = 0, startDate, endDate } = options

  const where: Record<string, unknown> = { patientId }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate
  }

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

// Export audit logs (HIPAA requirement)
export async function exportAuditLogs(options: {
  startDate: Date
  endDate: Date
  patientId?: string
  userId?: string
}) {
  const { startDate, endDate, patientId, userId } = options

  const where: Record<string, unknown> = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (patientId) where.patientId = patientId
  if (userId) where.userId = userId

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}
