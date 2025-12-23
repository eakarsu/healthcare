import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    // Only admins and managers can view audit logs
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return apiError('Forbidden', 403)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const entity = url.searchParams.get('entity')
    const userId = url.searchParams.get('userId')
    const patientId = url.searchParams.get('patientId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const where: Record<string, unknown> = {
      user: {
        practiceId: session.user.practiceId,
      },
    }

    if (action) where.action = action
    if (entity) where.entity = entity
    if (userId) where.userId = userId
    if (patientId) where.patientId = patientId

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Transform to include names
    const transformedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userId: log.userId,
      userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      patientId: log.patientId,
      phiAccessed: log.phiAccessed,
      ipAddress: log.ipAddress,
      timestamp: log.createdAt,
      changes: log.changes,
    }))

    return apiResponse({
      data: transformedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return apiError('Failed to fetch audit logs', 500)
  }
}
