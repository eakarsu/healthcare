import { getClient, isConfigured, mapDrFirstStatus, TransactionType } from './client'
import { prisma } from '@/lib/prisma'

export interface SendPrescriptionRequest {
  prescriptionId: string
  providerId: string
  patientId: string
  pharmacyNcpdpId: string
  drugName: string
  drugNdc?: string
  quantity: string
  quantityUnit: string
  daysSupply: number
  directions: string
  refills: number
  notes?: string
  isControlledSubstance: boolean
  schedule?: string
  substitutionAllowed: boolean
}

export interface SendPrescriptionResult {
  success: boolean
  transactionId?: string
  status?: string
  errorMessage?: string
}

/**
 * Send prescription via NCPDP SCRIPT
 */
export async function sendPrescription(
  request: SendPrescriptionRequest
): Promise<SendPrescriptionResult> {
  const {
    prescriptionId,
    providerId,
    patientId,
    pharmacyNcpdpId,
    drugName,
    drugNdc,
    quantity,
    quantityUnit,
    daysSupply,
    directions,
    refills,
    notes,
    isControlledSubstance,
    schedule,
    substitutionAllowed,
  } = request

  // Get prescription and related data
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      patient: true,
      provider: {
        include: {
          user: true,
          practice: true,
        },
      },
    },
  })

  if (!prescription) {
    return { success: false, errorMessage: 'Prescription not found' }
  }

  if (!isConfigured()) {
    // Return mock result for development
    const mockTransactionId = `MOCK-EPCS-${Date.now()}`

    // Save mock transaction
    await prisma.drFirstTransaction.create({
      data: {
        prescriptionId,
        transactionType: 'NEW_PRESCRIPTION',
        transactionId: mockTransactionId,
        ncpdpScriptVersion: '2017071',
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    // Update prescription status
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        prescriptionStatus: 'SENT_TO_PHARMACY',
        pharmacyNcpdpId,
      },
    })

    return {
      success: true,
      transactionId: mockTransactionId,
      status: 'SENT',
    }
  }

  try {
    const client = await getClient()

    // Build NCPDP SCRIPT NewRx message
    const message = {
      messageType: 'NewRx',
      prescriber: {
        npi: prescription.provider.npi,
        dea: prescription.provider.deaNumber,
        firstName: prescription.provider.user.firstName,
        lastName: prescription.provider.user.lastName,
        address: prescription.provider.practice.address,
        city: prescription.provider.practice.city,
        state: prescription.provider.practice.state,
        zip: prescription.provider.practice.zip,
        phone: prescription.provider.practice.phone,
      },
      patient: {
        firstName: prescription.patient.firstName,
        lastName: prescription.patient.lastName,
        dateOfBirth: prescription.patient.dateOfBirth.toISOString().split('T')[0],
        gender: prescription.patient.gender,
        address: prescription.patient.address,
        city: prescription.patient.city,
        state: prescription.patient.state,
        zip: prescription.patient.zip,
        phone: prescription.patient.phone,
      },
      pharmacy: {
        ncpdpId: pharmacyNcpdpId,
      },
      medication: {
        drugDescription: drugName,
        ndc: drugNdc,
        quantity: {
          value: quantity,
          codeListQualifier: quantityUnit,
        },
        daysSupply,
        directions,
        refillQuantity: refills,
        substitutions: substitutionAllowed ? '0' : '1', // 0 = allowed, 1 = not allowed
        note: notes,
      },
      ...(isControlledSubstance && {
        controlledSubstance: {
          schedule,
        },
      }),
    }

    // Send to DrFirst
    const response = await client.post('/erx/send', message)

    const transactionId = response.data.transactionId
    const status = mapDrFirstStatus(response.data.status)

    // Save transaction record
    await prisma.drFirstTransaction.create({
      data: {
        prescriptionId,
        transactionType: 'NEW_PRESCRIPTION',
        transactionId,
        ncpdpScriptVersion: '2017071',
        messageContent: JSON.stringify(message),
        status,
        sentAt: new Date(),
      },
    })

    // Update prescription status
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        prescriptionStatus: status === 'ACCEPTED' ? 'SENT_TO_PHARMACY' : 'PENDING',
        pharmacyNcpdpId,
      },
    })

    return {
      success: true,
      transactionId,
      status,
    }
  } catch (error) {
    console.error('Failed to send prescription:', error)

    // Save failed transaction
    await prisma.drFirstTransaction.create({
      data: {
        prescriptionId,
        transactionType: 'NEW_PRESCRIPTION',
        transactionId: `ERROR-${Date.now()}`,
        status: 'ERROR',
        responseCode: 'ERR',
        pharmacyResponse: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to send prescription',
    }
  }
}

/**
 * Cancel a prescription
 */
export async function cancelPrescription(
  prescriptionId: string,
  reason: string
): Promise<SendPrescriptionResult> {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      drFirstTransactions: {
        where: { transactionType: 'NEW_PRESCRIPTION', status: 'SENT' },
        orderBy: { sentAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!prescription) {
    return { success: false, errorMessage: 'Prescription not found' }
  }

  if (!prescription.pharmacyNcpdpId) {
    return { success: false, errorMessage: 'Prescription was not sent to a pharmacy' }
  }

  if (!isConfigured()) {
    // Mock cancellation
    const mockTransactionId = `MOCK-CANCEL-${Date.now()}`

    await prisma.drFirstTransaction.create({
      data: {
        prescriptionId,
        transactionType: 'CANCEL_PRESCRIPTION',
        transactionId: mockTransactionId,
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { prescriptionStatus: 'CANCELLED' },
    })

    return {
      success: true,
      transactionId: mockTransactionId,
      status: 'SENT',
    }
  }

  try {
    const client = await getClient()

    const response = await client.post('/erx/cancel', {
      originalTransactionId: prescription.drFirstTransactions[0]?.transactionId,
      prescriptionId,
      pharmacyNcpdpId: prescription.pharmacyNcpdpId,
      cancelReason: reason,
    })

    const transactionId = response.data.transactionId
    const status = mapDrFirstStatus(response.data.status)

    await prisma.drFirstTransaction.create({
      data: {
        prescriptionId,
        transactionType: 'CANCEL_PRESCRIPTION',
        transactionId,
        status,
        sentAt: new Date(),
      },
    })

    if (status === 'ACCEPTED' || status === 'SENT') {
      await prisma.prescription.update({
        where: { id: prescriptionId },
        data: { prescriptionStatus: 'CANCELLED' },
      })
    }

    return {
      success: true,
      transactionId,
      status,
    }
  } catch (error) {
    console.error('Failed to cancel prescription:', error)
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to cancel prescription',
    }
  }
}

/**
 * Check prescription status
 */
export async function checkPrescriptionStatus(
  transactionId: string
): Promise<{
  status: string
  pharmacyResponse?: string
  errorMessage?: string
}> {
  if (!isConfigured()) {
    return { status: 'ACCEPTED' }
  }

  try {
    const client = await getClient()
    const response = await client.get(`/erx/status/${transactionId}`)

    return {
      status: mapDrFirstStatus(response.data.status),
      pharmacyResponse: response.data.pharmacyResponse,
      errorMessage: response.data.errorMessage,
    }
  } catch (error) {
    console.error('Failed to check prescription status:', error)
    return {
      status: 'ERROR',
      errorMessage: error instanceof Error ? error.message : 'Status check failed',
    }
  }
}
