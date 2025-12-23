import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can export audit logs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const userId = searchParams.get('userId')
    const formatType = searchParams.get('format') || 'json'

    const where: any = {}

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }
    if (action) {
      where.action = action
    }
    if (entity) {
      where.entity = entity
    }
    if (userId) {
      where.userId = userId
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Log this export
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPORT',
        entity: 'AUDIT_LOG',
        changes: {
          filters: { startDate, endDate, action, entity, userId },
          recordCount: logs.length,
          format: formatType,
        },
      },
    })

    if (formatType === 'csv') {
      // Generate CSV
      const headers = [
        'Timestamp',
        'User',
        'Email',
        'Role',
        'Action',
        'Entity',
        'Entity ID',
        'PHI Accessed',
        'IP Address',
        'Changes',
      ]

      const rows = logs.map((log) => [
        format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        `${log.user.firstName} ${log.user.lastName}`,
        log.user.email,
        log.user.role,
        log.action,
        log.entity,
        log.entityId || '',
        log.phiAccessed ? 'Yes' : 'No',
        log.ipAddress || '',
        JSON.stringify(log.changes || {}),
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
        },
      })
    }

    // Return JSON by default
    return NextResponse.json({
      data: logs,
      total: logs.length,
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: session.user.id,
        name: `${session.user.firstName} ${session.user.lastName}`,
      },
    })
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 })
  }
}
