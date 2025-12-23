import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { generateSuperbillData, saveSuperbill } from '@/lib/superbill/generator'

/**
 * GET /api/superbill - List superbills
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (startDate || endDate) {
      where.serviceDate = {}
      if (startDate) (where.serviceDate as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.serviceDate as Record<string, Date>).lte = new Date(endDate)
    }

    const [superbills, total] = await Promise.all([
      prisma.superbill.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true },
          },
          encounter: {
            select: { id: true, encounterDate: true },
          },
        },
      }),
      prisma.superbill.count({ where }),
    ])

    // Get provider info
    const providerIds = [...new Set(superbills.map(sb => sb.providerId).filter(Boolean))]
    const providers = await prisma.provider.findMany({
      where: { id: { in: providerIds } },
      include: { user: { select: { firstName: true, lastName: true } } }
    })
    const providerMap = new Map(providers.map(p => [p.id, `${p.user.firstName} ${p.user.lastName}`]))

    return apiResponse({
      superbills: superbills.map((sb) => ({
        id: sb.id,
        superbillNumber: sb.superbillNumber,
        serviceDate: sb.serviceDate,
        patient: {
          firstName: sb.patient.firstName,
          lastName: sb.patient.lastName,
        },
        provider: {
          firstName: providerMap.get(sb.providerId)?.split(' ')[0] || 'Unknown',
          lastName: providerMap.get(sb.providerId)?.split(' ').slice(1).join(' ') || '',
          npi: '',
        },
        diagnoses: sb.diagnoses as Array<{ code: string; description: string }>,
        procedures: sb.procedures as Array<{ code: string; description: string; fee: number; units: number }>,
        totalCharges: sb.totalCharges,
        patientEstimate: sb.patientEstimate || 0,
        amountPaid: sb.amountPaid,
        pdfPath: sb.pdfPath,
        printedAt: sb.printedAt,
        emailedAt: sb.emailedAt,
        createdAt: sb.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to list superbills:', error)
    return apiError('Failed to list superbills', 500)
  }
}

/**
 * POST /api/superbill - Create a superbill from an encounter
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { encounterId, amountPaid } = body
    const { ipAddress, userAgent } = extractRequestInfo(request)

    if (!encounterId) {
      return apiError('Encounter ID is required', 400)
    }

    // Check if superbill already exists for this encounter
    const existingSuperbill = await prisma.superbill.findFirst({
      where: { encounterId },
    })

    if (existingSuperbill) {
      return apiResponse({
        superbill: existingSuperbill,
        message: 'Superbill already exists for this encounter',
      })
    }

    // Get encounter to find patient and provider IDs
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      select: {
        patientId: true,
        providerId: true,
      },
    })

    if (!encounter) {
      return apiError('Encounter not found', 404)
    }

    // Generate superbill data
    const superbillData = await generateSuperbillData(encounterId)

    // Update amount paid if provided
    if (amountPaid !== undefined) {
      superbillData.summary.amountPaid = amountPaid
      superbillData.summary.amountDue = superbillData.summary.patientEstimate - amountPaid
    }

    // Save to database
    const superbill = await saveSuperbill(
      encounterId,
      encounter.patientId,
      encounter.providerId,
      superbillData
    )

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Superbill',
      entityId: superbill.id,
      patientId: encounter.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({
      superbill,
      data: superbillData,
    })
  } catch (error) {
    console.error('Failed to create superbill:', error)
    return apiError('Failed to create superbill', 500)
  }
}
