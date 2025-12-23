import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils'
import { nanoid } from 'nanoid'

// GET - List lab orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)

    const patientId = url.searchParams.get('patientId')
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (priority) where.priority = priority

    const [labOrders, total] = await Promise.all([
      prisma.labOrder.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              mrn: true,
            },
          },
        },
        orderBy: { orderedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.labOrder.count({ where }),
    ])

    // Get provider info for each order
    const providerIds = [...new Set(labOrders.map(o => o.orderedBy).filter(Boolean))]
    const providers = await prisma.provider.findMany({
      where: { id: { in: providerIds } },
      include: { user: { select: { firstName: true, lastName: true } } }
    })
    const providerMap = new Map(providers.map(p => [p.id, p.user]))

    // Transform data for frontend consumption
    const transformedOrders = labOrders.map((order) => ({
      ...order,
      orderedBy: providerMap.get(order.orderedBy) || null,
    }))

    return apiResponse({
      orders: transformedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch lab orders:', error)
    return apiError('Failed to fetch lab orders', 500)
  }
}

// POST - Create lab order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)
    const body = await request.json()

    const {
      patientId,
      encounterId,
      labName,
      labPhone,
      labFax,
      specimenType,
      testCodes,
      testDescriptions,
      priority = 'ROUTINE',
      icdCodes = [],
      clinicalNotes,
    } = body

    if (!patientId) {
      return apiError('Patient ID is required', 400)
    }

    if (!testCodes || testCodes.length === 0) {
      return apiError('At least one test code is required', 400)
    }

    // Generate order number
    const orderNumber = `LAB-${Date.now()}-${nanoid(6).toUpperCase()}`

    const labOrder = await prisma.labOrder.create({
      data: {
        orderNumber,
        patientId,
        encounterId,
        orderedBy: session.user.id,
        labName,
        labPhone,
        labFax,
        specimenType,
        testCodes,
        testDescriptions: testDescriptions || testCodes,
        priority,
        icdCodes,
        clinicalNotes,
        status: 'PENDING',
        statusHistory: {
          create: {
            status: 'PENDING',
            changedBy: session.user.id,
            notes: 'Order created',
          },
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
          },
        },
        statusHistory: true,
      },
    })

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'LabOrder',
      entityId: labOrder.id,
      patientId,
      changes: {
        orderNumber,
        testCodes,
        priority,
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(labOrder, 201)
  } catch (error) {
    console.error('Failed to create lab order:', error)
    return apiError('Failed to create lab order', 500)
  }
}
