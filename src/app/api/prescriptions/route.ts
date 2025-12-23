import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import {
  checkDrugInteractions,
  checkAllergyConflict,
  generateSig,
  validateEPCSRequirements
} from '@/lib/prescribing'

// Get prescriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const providerId = searchParams.get('providerId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (providerId) where.providerId = providerId
    if (status) where.status = status

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true, mrn: true }
          },
          provider: {
            include: { user: { select: { firstName: true, lastName: true } } }
          },
          renewals: {
            orderBy: { requestDate: 'desc' },
            take: 1
          },
          fills: {
            orderBy: { fillDate: 'desc' },
            take: 1
          }
        },
        orderBy: { writtenDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.prescription.count({ where })
    ])

    return apiResponse({
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to get prescriptions:', error)
    return apiError('Failed to get prescriptions', 500)
  }
}

// Create new prescription
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      patientId,
      providerId,
      encounterId,
      drugName,
      drugCode,
      strength,
      form,
      dosage,
      frequency,
      route,
      duration,
      quantity,
      quantityUnit,
      refills,
      dispenseAsWritten,
      isControlled,
      scheduleClass,
      indication,
      notes,
      pharmacyId,
      pharmacyNpi,
      pharmacyName,
      pharmacyAddress,
      pharmacyPhone,
      pharmacyFax
    } = body

    if (!patientId || !providerId || !drugName || !dosage || !frequency || !quantity) {
      return apiError('Missing required fields', 400)
    }

    // Get patient with allergies and current medications
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: { where: { status: 'active' } },
        medications: { where: { status: 'active' } }
      }
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    // Check for allergy conflicts
    const allergyCheck = await checkAllergyConflict(
      drugName,
      patient.allergies.map(a => ({ allergen: a.allergen, severity: a.severity }))
    )

    if (allergyCheck.hasConflict) {
      const highRisk = allergyCheck.conflictingAllergies.some(
        a => a.crossReactivityRisk === 'HIGH'
      )

      if (highRisk) {
        return apiResponse({
          warning: true,
          type: 'ALLERGY_CONFLICT',
          severity: 'HIGH',
          ...allergyCheck,
          message: 'Patient has documented allergy - prescription not created'
        }, 409)
      }
    }

    // Check for drug interactions
    const interactionCheck = await checkDrugInteractions(
      drugCode || drugName,
      patient.medications.map(m => ({ name: m.name, code: undefined }))
    )

    // Get provider for DEA validation
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    })

    if (!provider) {
      return apiError('Provider not found', 404)
    }

    // EPCS validation for controlled substances
    let epcsValidation = null
    if (isControlled && scheduleClass) {
      epcsValidation = await validateEPCSRequirements(
        providerId,
        provider.licenseNumber, // Using license as DEA placeholder
        scheduleClass
      )

      if (!epcsValidation.canPrescribe) {
        return apiResponse({
          warning: true,
          type: 'EPCS_REQUIREMENTS_NOT_MET',
          ...epcsValidation,
          message: 'Cannot prescribe controlled substance - requirements not met'
        }, 409)
      }
    }

    // Generate RX number
    const rxNumber = `RX-${nanoid(10).toUpperCase()}`

    // Generate SIG
    const sig = generateSig({
      dosage,
      frequency,
      route: route || 'Oral',
      duration,
      additionalInstructions: notes
    })

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        rxNumber,
        patientId,
        providerId,
        encounterId,
        drugName,
        drugCode,
        strength,
        form,
        dosage: sig,
        frequency,
        route: route || 'Oral',
        duration,
        quantity,
        quantityUnit: quantityUnit || 'tablets',
        refills: refills || 0,
        dispenseAsWritten: dispenseAsWritten || false,
        isControlled: isControlled || false,
        scheduleClass,
        deaNumber: isControlled ? provider.licenseNumber : undefined,
        pharmacyId,
        pharmacyNpi,
        pharmacyName,
        pharmacyAddress,
        pharmacyPhone,
        pharmacyFax,
        indication,
        notes,
        status: 'DRAFT'
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true }
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        }
      }
    })

    return apiResponse({
      prescription,
      warnings: {
        allergyConflict: allergyCheck.hasConflict ? allergyCheck : null,
        drugInteractions: interactionCheck.hasInteractions ? interactionCheck : null
      }
    }, 201)
  } catch (error) {
    console.error('Failed to create prescription:', error)
    return apiError('Failed to create prescription', 500)
  }
}
