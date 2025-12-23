import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { verifyEligibility, isConfigured } from '@/lib/change-healthcare'
import type { EligibilityRequest } from '@/lib/change-healthcare/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { ipAddress, userAgent } = extractRequestInfo(request)

    const {
      patientInsuranceId,
      memberId,
      dateOfBirth,
      firstName,
      lastName,
      payerId,
      providerNpi,
      providerTaxId,
      serviceDate,
      serviceTypeCodes,
    } = body

    if (!memberId || !dateOfBirth || !payerId) {
      return apiError('Missing required fields: memberId, dateOfBirth, payerId', 400)
    }

    if (!providerNpi) {
      return apiError('Provider NPI is required', 400)
    }

    // Build eligibility request
    const eligibilityRequest: EligibilityRequest = {
      memberId,
      memberDateOfBirth: dateOfBirth,
      memberFirstName: firstName || '',
      memberLastName: lastName || '',
      payerId,
      providerNpi,
      providerTaxId,
      serviceDate: serviceDate || new Date().toISOString().split('T')[0],
      serviceTypeCodes: serviceTypeCodes || ['30'], // Health Benefit Plan Coverage
    }

    // Call Change Healthcare API (or mock if not configured)
    const result = await verifyEligibility(eligibilityRequest)

    // Store eligibility check in database if patientInsuranceId provided
    if (patientInsuranceId) {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Cache for 24 hours

      await prisma.eligibilityCheck.create({
        data: {
          patientInsuranceId,
          transactionId: result.transactionId,
          serviceDate: new Date(eligibilityRequest.serviceDate),
          serviceTypeCodes: eligibilityRequest.serviceTypeCodes || [],
          eligibilityStatus: result.status,
          coverageDetails: {
            planName: result.planName,
            groupNumber: result.groupNumber,
            effectiveDate: result.effectiveDate,
            terminationDate: result.terminationDate,
            networkStatus: result.networkStatus,
            coinsurance: result.coinsurance,
          },
          copayInfo: result.copay,
          deductibleInfo: result.deductible,
          outOfPocketInfo: result.outOfPocket,
          expiresAt,
        },
      })
    }

    // Transform response to match existing frontend expectations
    const eligibilityResult = {
      status: result.status.toLowerCase(),
      subscriberName: `${lastName || ''}, ${firstName || ''}`.trim() || 'Unknown',
      memberId: result.memberId || memberId,
      groupNumber: result.groupNumber,
      planName: result.planName,
      effectiveDate: result.effectiveDate,
      terminationDate: result.terminationDate,
      transactionId: result.transactionId,
      copay: {
        primaryCare: result.copay.find((c) => c.type.includes('Office'))?.amount || 25,
        specialist: result.copay.find((c) => c.type.includes('Specialist'))?.amount || 45,
        urgentCare: result.copay.find((c) => c.type.includes('Urgent'))?.amount || 75,
        emergency: result.copay.find((c) => c.type.includes('Emergency'))?.amount || 250,
      },
      deductible: {
        individual: result.deductible.find((d) => d.type === 'Individual')?.total || 1500,
        individualRemaining: result.deductible.find((d) => d.type === 'Individual')?.remaining || 1500,
        family: result.deductible.find((d) => d.type === 'Family')?.total || 3000,
        familyRemaining: result.deductible.find((d) => d.type === 'Family')?.remaining || 3000,
      },
      outOfPocketMax: {
        individual: result.outOfPocket.find((o) => o.type === 'Individual')?.total || 6000,
        individualRemaining: result.outOfPocket.find((o) => o.type === 'Individual')?.remaining || 6000,
        family: result.outOfPocket.find((o) => o.type === 'Family')?.total || 12000,
        familyRemaining: result.outOfPocket.find((o) => o.type === 'Family')?.remaining || 12000,
      },
      coinsurance: result.coinsurance || 20,
      networkStatus: result.networkStatus === 'IN_NETWORK' ? 'in-network' : 'out-of-network',
      priorAuthRequired: ['MRI', 'CT Scan', 'Outpatient Surgery', 'DME'],
      isRealData: isConfigured(),
    }

    // Log the eligibility check
    await createAuditLog({
      userId: session.user.id,
      action: 'VERIFY',
      entity: 'Insurance',
      entityId: memberId,
      changes: {
        payerId,
        serviceDate,
        transactionId: result.transactionId,
        status: result.status,
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse(eligibilityResult)
  } catch (error) {
    console.error('Failed to verify eligibility:', error)
    return apiError('Failed to verify eligibility', 500)
  }
}
