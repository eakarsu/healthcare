import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError, getPaginationParams } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const payerType = url.searchParams.get('type')
    const claimId = url.searchParams.get('claimId')

    const where: Record<string, unknown> = {
      claim: {
        provider: {
          practiceId: session.user.practiceId,
        },
      },
    }

    if (payerType) {
      where.payerType = payerType
    }

    if (claimId) {
      where.claimId = claimId
    }

    const [payments, total] = await Promise.all([
      prisma.claimPayment.findMany({
        where,
        include: {
          claim: {
            select: {
              id: true,
              claimNumber: true,
              patient: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        take: limit,
        skip,
      }),
      prisma.claimPayment.count({ where }),
    ])

    return apiResponse({
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return apiError('Failed to fetch payments', 500)
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

    // Find claim by ID or claim number
    let claim
    if (body.claimId) {
      claim = await prisma.claim.findUnique({
        where: { id: body.claimId },
      })
    } else if (body.claimNumber) {
      claim = await prisma.claim.findFirst({
        where: { claimNumber: body.claimNumber },
      })
    }

    if (!claim) {
      return apiError('Claim not found', 404)
    }

    // Create payment
    const payment = await prisma.claimPayment.create({
      data: {
        claimId: claim.id,
        paymentDate: new Date(),
        payerType: body.paymentType || body.payerType || 'Insurance',
        amount: body.amount,
        checkNumber: body.checkNumber,
        reference: body.notes || body.reference,
      },
      include: {
        claim: {
          select: {
            id: true,
            claimNumber: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    // Update claim totals
    const currentPaid = Number(claim.paidAmount) || 0
    const newTotalPaid = currentPaid + body.amount
    const totalCharges = Number(claim.totalCharges) || 0
    const adjustments = Number(claim.adjustmentAmount) || 0
    const newBalance = totalCharges - newTotalPaid - adjustments

    let newStatus = claim.status
    if (newBalance <= 0) {
      newStatus = 'PAID'
    } else if (newTotalPaid > 0) {
      newStatus = 'PARTIAL'
    }

    await prisma.claim.update({
      where: { id: claim.id },
      data: {
        paidAmount: newTotalPaid,
        status: newStatus,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'ClaimPayment',
      entityId: payment.id,
      patientId: claim.patientId,
      ipAddress,
      userAgent,
      phiAccessed: false,
    })

    return apiResponse(payment, 201)
  } catch (error) {
    console.error('Failed to create payment:', error)
    return apiError('Failed to create payment', 500)
  }
}
