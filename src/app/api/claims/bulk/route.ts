import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

// Bulk delete (void) claims
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    if (!['ADMIN', 'BILLER', 'MANAGER'].includes(session.user.role)) {
      return apiError('Insufficient permissions for bulk delete', 403)
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No claim IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot void more than 50 claims at once', 400)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const claims = await prisma.claim.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (claims.length !== ids.length) {
      return apiError('Some claims were not found or do not belong to your practice', 400)
    }

    // Only allow voiding claims that haven't been paid
    const paidClaims = claims.filter(c => ['PAID', 'PARTIAL'].includes(c.status))
    if (paidClaims.length > 0) {
      return apiError('Cannot void claims that have been paid or partially paid', 400)
    }

    await prisma.claim.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: 'VOID' },
    })

    for (const claim of claims) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_VOID',
        entity: 'Claim',
        entityId: claim.id,
        ipAddress,
        userAgent,
      })
    }

    return apiResponse({
      message: `${claims.length} claims voided successfully`,
      count: claims.length,
    })
  } catch (error) {
    console.error('Bulk delete claims error:', error)
    return apiError('Failed to bulk void claims', 500)
  }
}

// Bulk update claims
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    if (!['ADMIN', 'BILLER', 'MANAGER'].includes(session.user.role)) {
      return apiError('Insufficient permissions for bulk update', 403)
    }

    const { ids, data } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No claim IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot update more than 50 claims at once', 400)
    }

    if (!data || Object.keys(data).length === 0) {
      return apiError('No update data provided', 400)
    }

    const allowedFields = ['status']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiError('No valid fields to update', 400)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    const claims = await prisma.claim.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (claims.length !== ids.length) {
      return apiError('Some claims were not found', 400)
    }

    await prisma.claim.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    })

    for (const claim of claims) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_UPDATE',
        entity: 'Claim',
        entityId: claim.id,
        changes: updateData,
        ipAddress,
        userAgent,
      })
    }

    return apiResponse({
      message: `${claims.length} claims updated successfully`,
      count: claims.length,
    })
  } catch (error) {
    console.error('Bulk update claims error:', error)
    return apiError('Failed to bulk update claims', 500)
  }
}
