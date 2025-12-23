import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { generateClaimNumber, apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const patientId = url.searchParams.get('patientId')

    const where: Record<string, unknown> = {
      provider: {
        practiceId: session.user.practiceId,
      },
    }

    if (status) {
      where.status = status
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (search) {
      where.OR = [
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { mrn: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              mrn: true,
            },
          },
          insurancePlan: {
            select: {
              name: true,
              payerName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.claim.count({ where }),
    ])

    return apiResponse({
      claims,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch claims:', error)
    return apiError('Failed to fetch claims', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Get encounter with diagnoses and procedures
    const encounter = await prisma.encounter.findUnique({
      where: { id: body.encounterId },
      include: {
        patient: {
          include: {
            insurances: {
              where: { priority: 1 },
              include: { insurancePlan: true },
            },
          },
        },
        diagnoses: true,
        procedures: true,
      },
    })

    if (!encounter) {
      return apiError('Encounter not found', 404)
    }

    const primaryInsurance = encounter.patient.insurances[0]

    if (!primaryInsurance) {
      return apiError('Patient has no primary insurance', 400)
    }

    // Calculate total charges
    const totalCharges = body.lines?.reduce(
      (sum: number, line: { chargeAmount: number }) => sum + (line.chargeAmount || 0),
      0
    ) || 0

    // Create claim
    const claim = await prisma.claim.create({
      data: {
        claimNumber: generateClaimNumber(),
        encounterId: body.encounterId,
        patientId: encounter.patientId,
        providerId: encounter.providerId,
        insuranceId: primaryInsurance.id,
        insurancePlanId: primaryInsurance.insurancePlanId,
        serviceDate: encounter.encounterDate,
        totalCharges,
        paidAmount: 0,
        adjustmentAmount: 0,
        status: 'CREATED',
        lines: {
          create: body.lines?.map((line: {
            cptCode: string
            description: string
            modifiers?: string[]
            quantity: number
            chargeAmount: number
            diagnosisPointers?: number[]
          }, index: number) => ({
            lineNumber: index + 1,
            cptCode: line.cptCode,
            description: line.description,
            modifiers: line.modifiers || [],
            quantity: line.quantity || 1,
            chargeAmount: line.chargeAmount,
            diagnosisPointers: line.diagnosisPointers || [],
          })) || [],
        },
      },
      include: {
        patient: true,
        insurancePlan: true,
        lines: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Claim',
      entityId: claim.id,
      patientId: claim.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(claim, 201)
  } catch (error) {
    console.error('Failed to create claim:', error)
    return apiError('Failed to create claim', 500)
  }
}
