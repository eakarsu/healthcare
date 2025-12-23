import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { getFaxStatusDescription, isConfigured } from '@/lib/twilio-fax/client'

/**
 * GET /api/fax - List faxes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction') // INBOUND or OUTBOUND
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (direction) where.direction = direction
    if (status) where.status = status
    if (patientId) where.patientId = patientId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
    }

    const [faxes, total] = await Promise.all([
      prisma.faxMessage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.faxMessage.count({ where }),
    ])

    return apiResponse({
      faxes: faxes.map((fax) => ({
        id: fax.id,
        direction: fax.direction,
        status: fax.status,
        statusDescription: getFaxStatusDescription(fax.status.toLowerCase()),
        fromNumber: fax.fromNumber,
        toNumber: fax.toNumber,
        numPages: fax.numPages,
        category: fax.category,
        patient: fax.patient
          ? `${fax.patient.firstName} ${fax.patient.lastName}`
          : null,
        sentAt: fax.sentAt,
        receivedAt: fax.receivedAt,
        errorMessage: fax.errorMessage,
        hasDocument: !!fax.documentPath,
        createdAt: fax.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      isConfigured: isConfigured(),
    })
  } catch (error) {
    console.error('Failed to list faxes:', error)
    return apiError('Failed to list faxes', 500)
  }
}
