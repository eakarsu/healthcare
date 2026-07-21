import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { FHIRPatient, fhirToPatient } from '@/lib/fhir'
import { fhirProvenance, matchPatientIdentity } from '@/lib/clinical-governance'

type BundleEntry = { resource?: Record<string, unknown> }

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return apiError('Unauthorized', 401)
  if (!['ADMIN', 'PROVIDER'].includes(session.user.role)) return apiError('Clinical interoperability role required', 403)
  const { connectionId, eventId, bundle } = await request.json()
  if (typeof connectionId !== 'string' || typeof eventId !== 'string' || !connectionId || !eventId || eventId.length > 200 || bundle?.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) return apiError('connectionId, eventId (max 200 characters), and a FHIR R4 Bundle are required', 400)
  const serialized = JSON.stringify(bundle)
  if (serialized.length > 1_000_000) return apiError('FHIR bundle exceeds 1 MB', 413)
  const payloadHash = crypto.createHash('sha256').update(serialized).digest('hex')
  const connection = await prisma.fHIRConnection.findFirst({ where: { id: connectionId, practiceId: session.user.practiceId, status: 'active' } })
  if (!connection) return apiError('Active FHIR connection not found', 404)
  const provenance = fhirProvenance(connection.baseUrl, 'Patient')
  const prior = await prisma.fHIRSyncLog.findFirst({ where: { connectionId, externalEventId: eventId } })
  if (prior) {
    if (prior.payloadHash !== payloadHash) return apiError('FHIR event ID reused with a different payload', 409)
    return apiResponse({ idempotentReplay: true, resourceId: prior.resourceId, reviewStatus: prior.reviewStatus })
  }

  const entries = bundle.entry as BundleEntry[]
  const patientResource = entries.find(entry => entry.resource?.resourceType === 'Patient')?.resource as unknown as FHIRPatient | undefined
  const consentResource = entries.find(entry => entry.resource?.resourceType === 'Consent')?.resource as { status?: string; provision?: { period?: { end?: string } } } | undefined
  if (!patientResource || consentResource?.status !== 'active') return apiError('Bundle requires one Patient and active Consent resource', 422)
  const patientData = fhirToPatient(patientResource)
  if (!patientData.mrn || !patientData.firstName || !patientData.lastName || Number.isNaN(patientData.dateOfBirth.getTime())) return apiError('Patient requires MRN, legal name, and valid birthDate', 422)
  const candidates = await prisma.patient.findMany({
    where: { practiceId: session.user.practiceId, OR: [{ mrn: patientData.mrn }, { firstName: patientData.firstName, lastName: patientData.lastName, dateOfBirth: patientData.dateOfBirth }] },
    select: { id: true, mrn: true, firstName: true, lastName: true, dateOfBirth: true, email: true, phone: true }, take: 10,
  })
  const match = matchPatientIdentity({ ...patientData, mrn: patientData.mrn }, candidates)
  if (match.decision === 'MANUAL_REVIEW') {
    await prisma.fHIRSyncLog.create({ data: {
      connectionId, direction: 'inbound', resourceType: 'Patient', operation: 'identity-match', status: 'error',
      externalEventId: eventId, payloadHash, provenance, reviewStatus: 'manual_identity_review', errorMessage: 'Ambiguous patient identity',
    } })
    return apiError('Ambiguous patient identity requires manual review; no record was changed', 409)
  }

  if (match.decision === 'MATCH') {
    await prisma.$transaction([
      prisma.fHIRSyncLog.create({ data: {
        connectionId, direction: 'inbound', resourceType: 'Patient', resourceId: match.patientId,
        operation: 'identity-match', status: 'success', externalEventId: eventId, payloadHash, provenance, reviewStatus: 'linked_existing',
      } }),
      prisma.auditLog.create({ data: {
        userId: session.user.id, action: 'VERIFY', entity: 'FHIRIdentityMatch', entityId: match.patientId,
        patientId: match.patientId, phiAccessed: true, changes: { evidence: match.candidates[0].evidence, source: connection.name },
      } }),
    ])
    return apiResponse({ patientId: match.patientId, identityDecision: 'MATCH', provenance })
  }

  const expiresDate = consentResource.provision?.period?.end ? new Date(consentResource.provision.period.end) : null
  if (expiresDate && (Number.isNaN(expiresDate.getTime()) || expiresDate <= new Date())) {
    return apiError('FHIR Consent is expired or has an invalid end date', 422)
  }
  const created = await prisma.$transaction(async tx => {
    const patient = await tx.patient.create({ data: {
      mrn: patientData.mrn!, firstName: patientData.firstName!, lastName: patientData.lastName!,
      middleName: patientData.middleName, dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender as 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN', email: patientData.email,
      phone: patientData.phone, mobile: patientData.mobile, address: patientData.address, city: patientData.city,
      state: patientData.state, zip: patientData.zip, practiceId: session.user.practiceId,
      consents: { create: { type: 'RELEASE_OF_INFORMATION', status: 'signed', expiresDate } },
    } })
    await tx.fHIRSyncLog.create({ data: {
      connectionId, direction: 'inbound', resourceType: 'Patient', resourceId: patient.id, operation: 'create', status: 'success',
      externalEventId: eventId, payloadHash, provenance, reviewStatus: 'created_with_consent',
    } })
    await tx.auditLog.create({ data: {
      userId: session.user.id, action: 'CREATE', entity: 'FHIRPatient', entityId: patient.id,
      patientId: patient.id, phiAccessed: true,
      changes: { source: connection.name, consent: 'RELEASE_OF_INFORMATION' },
    } })
    return patient
  })
  return apiResponse({ patientId: created.id, identityDecision: 'NO_MATCH_CREATED', provenance }, 201)
}
