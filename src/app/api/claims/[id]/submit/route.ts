import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { submitClaim, isConfigured } from '@/lib/change-healthcare'
import type { ClaimSubmissionRequest } from '@/lib/change-healthcare/types'

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
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Fetch claim with all related data needed for EDI 837
    const existingClaim = await prisma.claim.findUnique({
      where: { id },
      include: {
        lines: true,
        insurancePlan: true,
        insurance: true,
        patient: true,
        provider: {
          include: {
            user: true,
            practice: true,
          },
        },
        encounter: {
          include: {
            diagnoses: true,
          },
        },
      },
    })

    if (!existingClaim) {
      return apiError('Claim not found', 404)
    }

    // Validate claim is in submittable status
    if (!['CREATED', 'VALIDATED'].includes(existingClaim.status)) {
      return apiError(`Claim cannot be submitted from status: ${existingClaim.status}`, 400)
    }

    // Validate claim has lines
    if (existingClaim.lines.length === 0) {
      return apiError('Claim must have at least one service line', 400)
    }

    // Validate claim has insurance (unless self-pay)
    if (!existingClaim.insurancePlanId) {
      return apiError('Claim must have insurance information', 400)
    }

    // Validate encounter has diagnoses
    if (!existingClaim.encounter?.diagnoses.length) {
      return apiError('Claim must have at least one diagnosis', 400)
    }

    // Validate provider has required info
    if (!existingClaim.provider.npi) {
      return apiError('Provider NPI is required for claim submission', 400)
    }

    // Build the claim submission request
    const practice = existingClaim.provider.practice
    const patient = existingClaim.patient
    const insurance = existingClaim.insurance
    const insurancePlan = existingClaim.insurancePlan

    const claimRequest: ClaimSubmissionRequest = {
      claimId: existingClaim.claimNumber,
      patientInfo: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        middleName: patient.middleName || undefined,
        dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
        gender: (patient.gender?.charAt(0).toUpperCase() as 'M' | 'F' | 'U') || 'U',
        memberId: insurance.memberId,
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        zip: patient.zip || '',
      },
      providerInfo: {
        npi: existingClaim.provider.npi!,
        taxId: practice.taxId || '',
        name: practice.name,
        address: practice.address || '',
        city: practice.city || '',
        state: practice.state || '',
        zip: practice.zip || '',
      },
      insuranceInfo: {
        payerId: insurancePlan.payerId || insurancePlan.electronicPayerId || '',
        payerName: insurancePlan.payerName,
        groupNumber: insurance.groupNumber || undefined,
        subscriberId: insurance.memberId,
        relationshipCode: mapRelationshipCode(insurance.relationship),
      },
      diagnoses: existingClaim.encounter!.diagnoses.map((d, index) => ({
        code: d.code,
        sequence: index + 1,
      })),
      procedures: existingClaim.lines.map((line) => ({
        cptCode: line.cptCode,
        modifiers: line.modifiers || [],
        quantity: line.quantity,
        chargeAmount: Number(line.chargeAmount),
        serviceDate: existingClaim.serviceDate.toISOString().split('T')[0],
        diagnosisPointers: line.diagnosisPointers.length > 0 ? line.diagnosisPointers : [1],
        placeOfService: existingClaim.placeOfService || '11',
      })),
      serviceDate: existingClaim.serviceDate.toISOString().split('T')[0],
      totalCharges: Number(existingClaim.totalCharges),
    }

    // Submit to Change Healthcare (or mock if not configured)
    const result = await submitClaim(claimRequest)

    // Store the submission record
    await prisma.claimSubmission.create({
      data: {
        claimId: existingClaim.id,
        submissionType: 'ORIGINAL',
        transactionId: result.transactionId,
        edi837Content: result.raw837,
        submittedAt: new Date(),
        clearinghouseStatus: result.status,
        responseCode: result.status === 'REJECTED' ? 'R' : 'A',
        responseMessage: result.errorMessage,
      },
    })

    // Update claim status
    const claim = await prisma.claim.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedDate: new Date(),
        clearinghouseId: result.transactionId,
      },
      include: {
        patient: true,
        insurancePlan: true,
        lines: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Claim',
      entityId: claim.id,
      patientId: claim.patientId,
      changes: {
        transactionId: result.transactionId,
        status: result.status,
        isRealSubmission: isConfigured(),
      },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({
      ...claim,
      submission: {
        transactionId: result.transactionId,
        status: result.status,
        claimNumber: result.claimNumber,
        isRealSubmission: isConfigured(),
      },
    })
  } catch (error) {
    console.error('Failed to submit claim:', error)
    return apiError('Failed to submit claim', 500)
  }
}

/**
 * Map patient relationship to EDI relationship code
 */
function mapRelationshipCode(relationship: string | null): string {
  const codes: Record<string, string> = {
    SELF: '18',
    SPOUSE: '01',
    CHILD: '19',
    OTHER: 'G8',
  }
  return codes[relationship || 'SELF'] || '18'
}
