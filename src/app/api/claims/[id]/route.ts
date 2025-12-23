import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            dateOfBirth: true,
          },
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        insurancePlan: {
          select: {
            name: true,
            payerName: true,
            payerId: true,
          },
        },
        encounter: {
          include: {
            diagnoses: true,
          },
        },
        lines: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    })

    if (!claim) {
      return apiError('Claim not found', 404)
    }

    // Create audit log for PHI access
    await createAuditLog({
      userId: session.user.id,
      action: 'READ',
      entity: 'Claim',
      entityId: claim.id,
      patientId: claim.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(claim)
  } catch (error) {
    console.error('Failed to fetch claim:', error)
    return apiError('Failed to fetch claim', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const existingClaim = await prisma.claim.findUnique({
      where: { id },
    })

    if (!existingClaim) {
      return apiError('Claim not found', 404)
    }

    // Only allow updates to claims in certain statuses
    if (['PAID', 'VOID'].includes(existingClaim.status)) {
      return apiError('Cannot modify a paid or voided claim', 400)
    }

    const updateData: Record<string, unknown> = {}

    if (body.status) updateData.status = body.status
    if (body.adjustmentAmount !== undefined) {
      updateData.adjustmentAmount = body.adjustmentAmount
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        insurancePlan: true,
        lines: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Claim',
      entityId: claim.id,
      patientId: claim.patientId,
      changes: body,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(claim)
  } catch (error) {
    console.error('Failed to update claim:', error)
    return apiError('Failed to update claim', 500)
  }
}
