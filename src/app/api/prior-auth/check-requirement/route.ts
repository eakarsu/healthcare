import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { checkAuthRequirement } from '@/lib/prior-auth'
import { prisma } from '@/lib/prisma'

// Check if prior auth is required for a procedure
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { procedureCode, insuranceId, diagnosisCodes } = await request.json()

    if (!procedureCode || !insuranceId) {
      return apiError('Procedure code and insurance ID are required', 400)
    }

    // Get insurance plan info
    const insurance = await prisma.patientInsurance.findUnique({
      where: { id: insuranceId },
      include: { insurancePlan: true }
    })

    if (!insurance) {
      return apiError('Insurance not found', 404)
    }

    // Check payer-specific rules first
    const payerRule = await prisma.payerAuthRules.findUnique({
      where: {
        payerId_procedureCode: {
          payerId: insurance.insurancePlanId,
          procedureCode
        }
      }
    })

    if (payerRule) {
      return apiResponse({
        requiresAuth: payerRule.requiresAuth,
        criteria: payerRule.authCriteria,
        typicalDuration: payerRule.typicalDuration,
        submissionMethod: payerRule.submissionUrl ? 'PORTAL' : 'FAX',
        portalUrl: payerRule.submissionUrl,
        faxNumber: payerRule.submissionFax,
        notes: payerRule.notes,
        source: 'PAYER_SPECIFIC'
      })
    }

    // Fall back to general rules
    const result = await checkAuthRequirement(
      procedureCode,
      insurance.insurancePlan.payerName,
      diagnosisCodes || []
    )

    return apiResponse({
      ...result,
      source: 'GENERAL_RULES'
    })
  } catch (error) {
    console.error('Failed to check auth requirement:', error)
    return apiError('Failed to check auth requirement', 500)
  }
}
