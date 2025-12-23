import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { generateClinicalJustification, generateAppealLetter } from '@/lib/prior-auth'

// Generate clinical justification or appeal letter
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
    const { type, additionalInfo } = await request.json()

    const auth = await prisma.priorAuthorization.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        insurance: {
          include: {
            insurancePlan: true
          }
        }
      }
    })

    if (!auth) {
      return apiError('Prior authorization not found', 404)
    }

    // Get procedure and diagnosis descriptions
    const procedureDescriptions = await prisma.cPTCode.findMany({
      where: { code: { in: auth.procedureCodes } }
    })

    const diagnosisDescriptions = await prisma.iCD10Code.findMany({
      where: { code: { in: auth.diagnosisCodes } }
    })

    if (type === 'justification') {
      const result = await generateClinicalJustification({
        patientInfo: {
          name: `${auth.patient.firstName} ${auth.patient.lastName}`,
          dateOfBirth: auth.patient.dateOfBirth.toISOString().split('T')[0],
          memberId: auth.insurance.subscriberId
        },
        procedureCode: auth.procedureCodes[0] || '',
        procedureDescription: procedureDescriptions[0]?.description || 'Medical procedure',
        diagnosisCodes: diagnosisDescriptions.map(d => ({
          code: d.code,
          description: d.description
        })),
        clinicalHistory: auth.clinicalNotes || '',
        providerInfo: {
          name: `${auth.provider.user.firstName} ${auth.provider.user.lastName}`,
          npi: auth.provider.npi || '',
          specialty: auth.provider.specialty
        }
      })

      return apiResponse(result)
    } else if (type === 'appeal') {
      if (auth.status !== 'DENIED') {
        return apiError('Appeals can only be generated for denied authorizations', 400)
      }

      const result = await generateAppealLetter({
        originalAuth: {
          procedureCode: auth.procedureCodes[0] || '',
          procedureDescription: procedureDescriptions[0]?.description || 'Medical procedure',
          diagnosisCodes: diagnosisDescriptions.map(d => ({
            code: d.code,
            description: d.description
          })),
          denialReason: auth.denialReason || 'Not specified',
          denialDate: auth.respondedAt?.toISOString().split('T')[0] || ''
        },
        patientInfo: {
          name: `${auth.patient.firstName} ${auth.patient.lastName}`,
          dateOfBirth: auth.patient.dateOfBirth.toISOString().split('T')[0],
          memberId: auth.insurance.subscriberId
        },
        additionalClinicalInfo: additionalInfo || auth.clinicalNotes || '',
        providerInfo: {
          name: `${auth.provider.user.firstName} ${auth.provider.user.lastName}`,
          npi: auth.provider.npi || '',
          specialty: auth.provider.specialty
        }
      })

      return apiResponse(result)
    } else {
      return apiError('Invalid type. Use "justification" or "appeal"', 400)
    }
  } catch (error) {
    console.error('Failed to generate letter:', error)
    return apiError('Failed to generate letter', 500)
  }
}
