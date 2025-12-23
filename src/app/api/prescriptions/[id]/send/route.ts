import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { transmitPrescription, validateEPCSRequirements } from '@/lib/prescribing'

// Send prescription to pharmacy
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { method, epcsSignature } = await request.json()

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: {
          include: { user: true }
        }
      }
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    if (!['DRAFT', 'PENDING_SIGNATURE', 'READY_TO_SEND'].includes(prescription.status)) {
      return apiError('Prescription cannot be sent in current status', 400)
    }

    if (!prescription.pharmacyNpi && !prescription.pharmacyName) {
      return apiError('Pharmacy information required', 400)
    }

    // EPCS signing for controlled substances
    if (prescription.isControlled) {
      if (!epcsSignature) {
        return apiError('EPCS signature required for controlled substances', 400)
      }

      const epcsValidation = await validateEPCSRequirements(
        prescription.providerId,
        prescription.deaNumber,
        prescription.scheduleClass as 'II' | 'III' | 'IV' | 'V'
      )

      if (!epcsValidation.canPrescribe) {
        return apiResponse({
          success: false,
          type: 'EPCS_VALIDATION_FAILED',
          ...epcsValidation
        }, 400)
      }

      // Update with EPCS signature
      await prisma.prescription.update({
        where: { id },
        data: {
          epcsSigned: true,
          epcsSignedAt: new Date(),
          epcsSignature: epcsSignature // In production, encrypt this
        }
      })
    }

    // Transmit prescription
    const transmissionMethod = method || 'ELECTRONIC'

    const result = await transmitPrescription(
      {
        rxNumber: prescription.rxNumber,
        drug: {
          ndcCode: prescription.drugCode || '',
          brandName: prescription.drugName,
          genericName: prescription.drugName,
          strength: prescription.strength || undefined,
          form: prescription.form || undefined,
          isControlled: prescription.isControlled
        },
        sig: prescription.dosage,
        quantity: prescription.quantity,
        refills: prescription.refills,
        dispenseAsWritten: prescription.dispenseAsWritten,
        patient: {
          firstName: prescription.patient.firstName,
          lastName: prescription.patient.lastName,
          dateOfBirth: prescription.patient.dateOfBirth.toISOString().split('T')[0],
          address: `${prescription.patient.address || ''}, ${prescription.patient.city || ''}, ${prescription.patient.state || ''} ${prescription.patient.zip || ''}`,
          phone: prescription.patient.phone || ''
        },
        provider: {
          npi: prescription.provider.npi || '',
          deaNumber: prescription.deaNumber || undefined,
          firstName: prescription.provider.user.firstName,
          lastName: prescription.provider.user.lastName,
          phone: '' // Would come from practice settings
        },
        pharmacy: {
          npi: prescription.pharmacyNpi || '',
          ncpdpId: undefined,
          name: prescription.pharmacyName || ''
        }
      },
      transmissionMethod as 'ELECTRONIC' | 'FAX' | 'PRINT'
    )

    if (result.success) {
      await prisma.prescription.update({
        where: { id },
        data: {
          status: 'SENT',
          transmissionMethod: transmissionMethod,
          transmittedAt: new Date(),
          transmissionRef: result.transmissionId,
          transmissionStatus: result.status
        }
      })

      return apiResponse({
        success: true,
        transmissionId: result.transmissionId,
        status: result.status,
        method: transmissionMethod
      })
    } else {
      return apiResponse({
        success: false,
        error: result.errorMessage
      }, 500)
    }
  } catch (error) {
    console.error('Failed to send prescription:', error)
    return apiError('Failed to send prescription', 500)
  }
}
