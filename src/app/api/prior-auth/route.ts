import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import {
  checkAuthRequirement,
  generateClinicalJustification,
  generateAppealLetter
} from '@/lib/prior-auth'

// Get all prior authorizations or create new one
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (patientId) where.patientId = patientId

    const [authorizations, total] = await Promise.all([
      prisma.priorAuthorization.findMany({
        where,
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true, mrn: true }
          },
          provider: {
            include: { user: { select: { firstName: true, lastName: true } } }
          },
          insurance: {
            include: { insurancePlan: { select: { name: true, payerName: true } } }
          }
        },
        orderBy: { requestDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.priorAuthorization.count({ where })
    ])

    return apiResponse({
      authorizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to get prior authorizations:', error)
    return apiError('Failed to get prior authorizations', 500)
  }
}

// Create new prior authorization
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      patientId,
      providerId,
      insuranceId,
      encounterId,
      serviceType,
      procedureCodes,
      diagnosisCodes,
      quantity,
      urgency,
      clinicalNotes,
      serviceDate
    } = body

    if (!patientId || !providerId || !insuranceId || !procedureCodes?.length) {
      return apiError('Missing required fields', 400)
    }

    // Check auth requirements for procedures
    const insurance = await prisma.patientInsurance.findUnique({
      where: { id: insuranceId },
      include: { insurancePlan: true }
    })

    if (!insurance) {
      return apiError('Insurance not found', 404)
    }

    // Create prior authorization
    const auth = await prisma.priorAuthorization.create({
      data: {
        patientId,
        providerId,
        insuranceId,
        encounterId,
        serviceType: serviceType || 'Medical',
        procedureCodes,
        diagnosisCodes: diagnosisCodes || [],
        quantity: quantity || 1,
        urgency: urgency || 'STANDARD',
        clinicalNotes,
        serviceDate: serviceDate ? new Date(serviceDate) : undefined,
        status: 'PENDING',
        submissionLog: []
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        insurance: {
          include: { insurancePlan: true }
        }
      }
    })

    return apiResponse(auth, 201)
  } catch (error) {
    console.error('Failed to create prior authorization:', error)
    return apiError('Failed to create prior authorization', 500)
  }
}
