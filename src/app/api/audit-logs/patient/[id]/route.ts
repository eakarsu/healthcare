import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can view patient access logs
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {
      OR: [
        { entityId: params.id },
        { changes: { path: ['patientId'], equals: params.id } },
      ],
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }

    const [logs, patient] = await Promise.all([
      prisma.auditLog.findMany({
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
        take: limit,
      }),
      prisma.patient.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mrn: true,
        },
      }),
    ])

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Log this access
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'READ',
        entity: 'AUDIT_LOG',
        entityId: params.id,
        changes: {
          action: 'VIEW_PATIENT_ACCESS_LOG',
          patientId: params.id,
          patientMRN: patient.mrn,
        },
        phiAccessed: true,
      },
    })

    return NextResponse.json({
      patient,
      logs,
      total: logs.length,
    })
  } catch (error) {
    console.error('Error fetching patient audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
