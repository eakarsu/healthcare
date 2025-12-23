import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { LabOrderStatus } from '@prisma/client'

const STATUS_TRANSITIONS: Record<LabOrderStatus, LabOrderStatus[]> = {
  PENDING: ['SPECIMEN_COLLECTED', 'CANCELLED'],
  SPECIMEN_COLLECTED: ['SENT_TO_LAB', 'CANCELLED'],
  SENT_TO_LAB: ['IN_PROGRESS', 'RESULTS_RECEIVED'],
  IN_PROGRESS: ['RESULTS_RECEIVED'],
  RESULTS_RECEIVED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)
    const body = await request.json()

    const { status, notes, resultsDocumentId, patientNotified } = body

    if (!status) {
      return apiError('Status is required', 400)
    }

    const existingOrder = await prisma.labOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return apiError('Lab order not found', 404)
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[existingOrder.status]
    if (!allowedTransitions.includes(status)) {
      return apiError(
        `Invalid status transition from ${existingOrder.status} to ${status}`,
        400
      )
    }

    // Build update data based on status
    const updateData: Record<string, unknown> = {
      status,
      statusHistory: {
        create: {
          status,
          changedBy: session.user.id,
          notes: notes || undefined,
        },
      },
    }

    // Set timestamps based on status
    switch (status) {
      case 'SPECIMEN_COLLECTED':
        updateData.specimenCollectedAt = new Date()
        break
      case 'SENT_TO_LAB':
        updateData.specimenSentAt = new Date()
        break
      case 'RESULTS_RECEIVED':
        updateData.resultsReceivedAt = new Date()
        if (resultsDocumentId) {
          updateData.resultsDocumentId = resultsDocumentId
        }
        break
      case 'REVIEWED':
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = session.user.id
        break
      case 'COMPLETED':
        // Check if patient notification tracking is provided
        if (patientNotified !== undefined) {
          updateData.patientNotified = patientNotified
          if (patientNotified) {
            updateData.patientNotifiedAt = new Date()
          }
        }
        break
    }

    if (notes) {
      updateData.followUpNotes = existingOrder.followUpNotes
        ? `${existingOrder.followUpNotes}\n\n[${new Date().toISOString()}] ${notes}`
        : notes
    }

    const labOrder = await prisma.labOrder.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    })

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'LabOrder',
      entityId: id,
      patientId: existingOrder.patientId,
      changes: {
        previousStatus: existingOrder.status,
        newStatus: status,
        notes,
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(labOrder)
  } catch (error) {
    console.error('Failed to update lab order status:', error)
    return apiError('Failed to update lab order status', 500)
  }
}
