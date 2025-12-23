import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { sendPrescription, cancelPrescription } from '@/lib/drfirst/ncpdp-script'
import { isConfigured } from '@/lib/drfirst/client'

/**
 * POST /api/eprescribe/drfirst/send - Send prescription electronically
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const {
      prescriptionId,
      pharmacyNcpdpId,
    } = body

    if (!prescriptionId) {
      return apiError('Prescription ID is required', 400)
    }

    if (!pharmacyNcpdpId) {
      return apiError('Pharmacy NCPDP ID is required', 400)
    }

    // Get prescription details
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
        provider: {
          include: {
            user: true,
          },
        },
        medication: true,
      },
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    // Check if already sent
    if (prescription.prescriptionStatus === 'SENT_TO_PHARMACY') {
      return apiError('Prescription has already been sent to pharmacy', 400)
    }

    // Determine if controlled substance
    const isControlledSubstance = prescription.medication?.schedule !== null &&
      ['II', 'III', 'IV', 'V'].includes(prescription.medication?.schedule || '')

    // Send prescription
    const result = await sendPrescription({
      prescriptionId,
      providerId: prescription.providerId,
      patientId: prescription.patientId,
      pharmacyNcpdpId,
      drugName: prescription.medication?.name || prescription.medicationName || '',
      drugNdc: prescription.medication?.ndc || undefined,
      quantity: prescription.quantity || '',
      quantityUnit: prescription.quantityUnit || 'EA',
      daysSupply: prescription.daysSupply || 30,
      directions: prescription.directions || '',
      refills: prescription.refills || 0,
      notes: prescription.notes || undefined,
      isControlledSubstance,
      schedule: prescription.medication?.schedule || undefined,
      substitutionAllowed: prescription.substitutionAllowed ?? true,
    })

    if (!result.success) {
      return apiError(result.errorMessage || 'Failed to send prescription', 500)
    }

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Prescription',
      entityId: prescriptionId,
      patientId: prescription.patientId,
      changes: {
        action: 'sent_electronically',
        pharmacyNcpdpId,
        transactionId: result.transactionId,
        status: result.status,
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      pharmacyNcpdpId,
      isRealSubmission: isConfigured(),
    })
  } catch (error) {
    console.error('Failed to send e-prescription:', error)
    return apiError('Failed to send e-prescription', 500)
  }
}

/**
 * DELETE /api/eprescribe/drfirst/send - Cancel prescription
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get('prescriptionId')
    const reason = searchParams.get('reason') || 'Cancelled by prescriber'
    const { ipAddress, userAgent } = extractRequestInfo(request)

    if (!prescriptionId) {
      return apiError('Prescription ID is required', 400)
    }

    // Get prescription details
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    // Cancel prescription
    const result = await cancelPrescription(prescriptionId, reason)

    if (!result.success) {
      return apiError(result.errorMessage || 'Failed to cancel prescription', 500)
    }

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Prescription',
      entityId: prescriptionId,
      patientId: prescription.patientId,
      changes: {
        action: 'cancelled',
        reason,
        transactionId: result.transactionId,
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
    })
  } catch (error) {
    console.error('Failed to cancel e-prescription:', error)
    return apiError('Failed to cancel e-prescription', 500)
  }
}
