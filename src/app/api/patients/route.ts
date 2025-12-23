import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { generateMRN, apiResponse, apiError, getPaginationParams } from '@/lib/utils'
import { encrypt } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = {
      practiceId: session.user.practiceId,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { mrn: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          insurances: {
            where: { priority: 1 },
            include: {
              insurancePlan: {
                select: { id: true, name: true, payerName: true, payerId: true },
              },
            },
          },
        },
        orderBy: { lastName: 'asc' },
        take: limit,
        skip,
      }),
      prisma.patient.count({ where }),
    ])

    return apiResponse({
      data: patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch patients:', error)
    return apiError('Failed to fetch patients', 500)
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

    // Encrypt sensitive fields
    const patientData = {
      ...body,
      mrn: generateMRN(),
      practiceId: session.user.practiceId,
      dateOfBirth: new Date(body.dateOfBirth),
    }

    // Encrypt SSN if provided
    if (patientData.ssn) {
      patientData.ssn = encrypt(patientData.ssn)
    }

    const patient = await prisma.patient.create({
      data: patientData,
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient.id,
      patientId: patient.id,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(patient, 201)
  } catch (error) {
    console.error('Failed to create patient:', error)
    return apiError('Failed to create patient', 500)
  }
}
