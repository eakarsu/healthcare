import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

// Bulk delete (soft delete) patients
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    if (session.user.role !== 'ADMIN') {
      return apiError('Only administrators can perform bulk delete', 403)
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No patient IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot delete more than 50 patients at once', 400)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Verify all patients belong to the practice
    const patients = await prisma.patient.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (patients.length !== ids.length) {
      return apiError('Some patients were not found or do not belong to your practice', 400)
    }

    // Soft delete
    await prisma.patient.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: 'INACTIVE' },
    })

    // Create audit logs
    for (const patient of patients) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_DELETE',
        entity: 'Patient',
        entityId: patient.id,
        patientId: patient.id,
        ipAddress,
        userAgent,
        phiAccessed: true,
      })
    }

    return apiResponse({
      message: `${patients.length} patients deactivated successfully`,
      count: patients.length,
    })
  } catch (error) {
    console.error('Bulk delete patients error:', error)
    return apiError('Failed to bulk delete patients', 500)
  }
}

// Bulk update patients
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return apiError('Insufficient permissions for bulk update', 403)
    }

    const { ids, data } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('No patient IDs provided', 400)
    }

    if (ids.length > 50) {
      return apiError('Cannot update more than 50 patients at once', 400)
    }

    if (!data || Object.keys(data).length === 0) {
      return apiError('No update data provided', 400)
    }

    // Only allow certain fields for bulk update
    const allowedFields = ['status', 'preferredLanguage', 'preferredContactMethod']
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

    // Verify all patients belong to the practice
    const patients = await prisma.patient.findMany({
      where: {
        id: { in: ids },
      },
    })

    if (patients.length !== ids.length) {
      return apiError('Some patients were not found or do not belong to your practice', 400)
    }

    await prisma.patient.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    })

    // Create audit logs
    for (const patient of patients) {
      await createAuditLog({
        userId: session.user.id,
        action: 'BULK_UPDATE',
        entity: 'Patient',
        entityId: patient.id,
        patientId: patient.id,
        changes: updateData,
        ipAddress,
        userAgent,
        phiAccessed: true,
      })
    }

    return apiResponse({
      message: `${patients.length} patients updated successfully`,
      count: patients.length,
    })
  } catch (error) {
    console.error('Bulk update patients error:', error)
    return apiError('Failed to bulk update patients', 500)
  }
}
