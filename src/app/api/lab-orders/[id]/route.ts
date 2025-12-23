import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'

// GET - Get lab order by ID
export async function GET(
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

    const labOrder = await prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            mrn: true,
            phone: true,
            email: true,
          },
        },
        encounter: {
          select: {
            id: true,
            encounterNumber: true,
            encounterDate: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    })

    if (!labOrder) {
      return apiError('Lab order not found', 404)
    }

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'READ',
      entity: 'LabOrder',
      entityId: id,
      patientId: labOrder.patientId,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(labOrder)
  } catch (error) {
    console.error('Failed to fetch lab order:', error)
    return apiError('Failed to fetch lab order', 500)
  }
}

// PUT - Update lab order
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

    const existingOrder = await prisma.labOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return apiError('Lab order not found', 404)
    }

    // Prevent editing completed orders
    if (['COMPLETED', 'CANCELLED'].includes(existingOrder.status)) {
      return apiError('Cannot edit completed or cancelled orders', 400)
    }

    const {
      labName,
      labPhone,
      labFax,
      specimenType,
      testCodes,
      testDescriptions,
      priority,
      icdCodes,
      clinicalNotes,
      expectedResultsAt,
      followUpNotes,
    } = body

    const labOrder = await prisma.labOrder.update({
      where: { id },
      data: {
        labName,
        labPhone,
        labFax,
        specimenType,
        testCodes,
        testDescriptions,
        priority,
        icdCodes,
        clinicalNotes,
        expectedResultsAt: expectedResultsAt ? new Date(expectedResultsAt) : undefined,
        followUpNotes,
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
      patientId: labOrder.patientId,
      changes: body,
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(labOrder)
  } catch (error) {
    console.error('Failed to update lab order:', error)
    return apiError('Failed to update lab order', 500)
  }
}

// DELETE - Cancel lab order
export async function DELETE(
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

    const existingOrder = await prisma.labOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return apiError('Lab order not found', 404)
    }

    // Only allow cancellation of pending orders
    if (!['PENDING', 'SPECIMEN_COLLECTED'].includes(existingOrder.status)) {
      return apiError('Can only cancel pending or collected orders', 400)
    }

    const labOrder = await prisma.labOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        statusHistory: {
          create: {
            status: 'CANCELLED',
            changedBy: session.user.id,
            notes: 'Order cancelled',
          },
        },
      },
    })

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'LabOrder',
      entityId: id,
      patientId: existingOrder.patientId,
      changes: { status: 'CANCELLED' },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({ success: true, message: 'Lab order cancelled' })
  } catch (error) {
    console.error('Failed to cancel lab order:', error)
    return apiError('Failed to cancel lab order', 500)
  }
}
