import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import {
  patientToFHIR,
  conditionToFHIR,
  allergyToFHIR,
  medicationToFHIR,
  vitalsToFHIR,
  FHIRClient
} from '@/lib/fhir'
import { hasValidConsent } from '@/lib/clinical-governance'
import { createAuditLog } from '@/lib/audit'

async function authorizeFHIRPatient(session: { user: { id: string; role: string; practiceId: string } }, patientId: string) {
  if (!['ADMIN', 'MANAGER', 'PROVIDER', 'NURSE'].includes(session.user.role)) return null
  const patient = await prisma.patient.findFirst({ where: { id: patientId, practiceId: session.user.practiceId }, include: { consents: true } })
  if (!patient || !hasValidConsent(patient.consents, 'RELEASE_OF_INFORMATION')) return null
  await createAuditLog({ userId: session.user.id, action: 'READ', entity: 'FHIRPatient', entityId: patient.id, patientId: patient.id, phiAccessed: true })
  return patient
}

// Get FHIR capability statement or resources
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }
    if (!['ADMIN', 'MANAGER', 'PROVIDER', 'NURSE'].includes(session.user.role)) return apiError('Clinical interoperability role required', 403)

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const patientId = searchParams.get('patientId')
    const format = searchParams.get('_format') || 'json'

    // Return capability statement
    if (!resourceType) {
      return apiResponse({
        resourceType: 'CapabilityStatement',
        fhirVersion: '4.0.1',
        format: ['json'],
        status: 'active',
        kind: 'instance',
        software: {
          name: 'Healthcare Practice AI',
          version: '1.0.0'
        },
        implementation: {
          description: 'Healthcare Practice AI FHIR Server'
        },
        rest: [{
          mode: 'server',
          resource: [
            {
              type: 'Patient',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
                { code: 'create' },
                { code: 'update' }
              ],
              searchParam: [
                { name: '_id', type: 'token' },
                { name: 'identifier', type: 'token' },
                { name: 'name', type: 'string' },
                { name: 'birthdate', type: 'date' }
              ]
            },
            {
              type: 'Observation',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
                { code: 'create' }
              ],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'category', type: 'token' },
                { name: 'code', type: 'token' }
              ]
            },
            {
              type: 'Condition',
              interaction: [
                { code: 'read' },
                { code: 'search-type' }
              ]
            },
            {
              type: 'AllergyIntolerance',
              interaction: [
                { code: 'read' },
                { code: 'search-type' }
              ]
            },
            {
              type: 'MedicationStatement',
              interaction: [
                { code: 'read' },
                { code: 'search-type' }
              ]
            }
          ]
        }]
      })
    }

    // Handle specific resource types
    switch (resourceType) {
      case 'Patient': {
        if (patientId) {
          const patient = await authorizeFHIRPatient(session, patientId)
          if (!patient) {
            return apiError('Patient not found', 404)
          }
          return apiResponse(patientToFHIR(patient))
        }

        // Search patients
        const name = searchParams.get('name')
        const birthdate = searchParams.get('birthdate')

        const patients = await prisma.patient.findMany({
          where: {
            practiceId: session.user.practiceId,
            consents: { some: { type: 'RELEASE_OF_INFORMATION', status: 'signed', OR: [{ expiresDate: null }, { expiresDate: { gt: new Date() } }] } },
            ...(name ? {
              OR: [
                { firstName: { contains: name, mode: 'insensitive' } },
                { lastName: { contains: name, mode: 'insensitive' } }
              ]
            } : {}),
            ...(birthdate ? { dateOfBirth: new Date(birthdate) } : {})
          },
          take: 50
        })

        return apiResponse({
          resourceType: 'Bundle',
          type: 'searchset',
          total: patients.length,
          entry: patients.map(p => ({
            resource: patientToFHIR(p),
            search: { mode: 'match' }
          }))
        })
      }

      case 'Observation': {
        if (!patientId) {
          return apiError('Patient ID required for Observation search', 400)
        }
        if (!await authorizeFHIRPatient(session, patientId)) return apiError('Patient not found or release consent is not active', 403)

        const category = searchParams.get('category')

        const encounters = await prisma.encounter.findMany({
          where: { patientId },
          orderBy: { encounterDate: 'desc' },
          take: 10
        })

        const observations = encounters.flatMap(enc => {
          if (enc.bloodPressureSystolic || enc.heartRate || enc.temperature) {
            return vitalsToFHIR({
              id: enc.id,
              patientId,
              encounterId: enc.id,
              bloodPressureSystolic: enc.bloodPressureSystolic || undefined,
              bloodPressureDiastolic: enc.bloodPressureDiastolic || undefined,
              heartRate: enc.heartRate || undefined,
              temperature: enc.temperature ? Number(enc.temperature) : undefined,
              respiratoryRate: enc.respiratoryRate || undefined,
              oxygenSaturation: enc.oxygenSaturation || undefined,
              weight: enc.weight ? Number(enc.weight) : undefined,
              height: enc.height ? Number(enc.height) : undefined,
              recordedAt: enc.encounterDate
            })
          }
          return []
        })

        return apiResponse({
          resourceType: 'Bundle',
          type: 'searchset',
          total: observations.length,
          entry: observations.map(o => ({
            resource: o,
            search: { mode: 'match' }
          }))
        })
      }

      case 'Condition': {
        if (!patientId) {
          return apiError('Patient ID required for Condition search', 400)
        }
        if (!await authorizeFHIRPatient(session, patientId)) return apiError('Patient not found or release consent is not active', 403)

        const conditions = await prisma.condition.findMany({
          where: { patientId }
        })

        return apiResponse({
          resourceType: 'Bundle',
          type: 'searchset',
          total: conditions.length,
          entry: conditions.map(c => ({
            resource: conditionToFHIR({
              id: c.id,
              patientId: c.patientId,
              icdCode: c.icdCode || undefined,
              name: c.name,
              status: c.status,
              onsetDate: c.onsetDate || undefined,
              resolvedDate: c.resolvedDate || undefined
            }),
            search: { mode: 'match' }
          }))
        })
      }

      case 'AllergyIntolerance': {
        if (!patientId) {
          return apiError('Patient ID required for AllergyIntolerance search', 400)
        }
        if (!await authorizeFHIRPatient(session, patientId)) return apiError('Patient not found or release consent is not active', 403)

        const allergies = await prisma.allergy.findMany({
          where: { patientId }
        })

        return apiResponse({
          resourceType: 'Bundle',
          type: 'searchset',
          total: allergies.length,
          entry: allergies.map(a => ({
            resource: allergyToFHIR({
              id: a.id,
              patientId: a.patientId,
              allergen: a.allergen,
              reaction: a.reaction || undefined,
              severity: a.severity,
              status: a.status,
              onsetDate: a.onsetDate || undefined
            }),
            search: { mode: 'match' }
          }))
        })
      }

      case 'MedicationStatement': {
        if (!patientId) {
          return apiError('Patient ID required for MedicationStatement search', 400)
        }
        if (!await authorizeFHIRPatient(session, patientId)) return apiError('Patient not found or release consent is not active', 403)

        const medications = await prisma.medication.findMany({
          where: { patientId }
        })

        return apiResponse({
          resourceType: 'Bundle',
          type: 'searchset',
          total: medications.length,
          entry: medications.map(m => ({
            resource: medicationToFHIR({
              id: m.id,
              patientId: m.patientId,
              name: m.name,
              dosage: m.dosage || undefined,
              frequency: m.frequency || undefined,
              route: m.route || undefined,
              status: m.status,
              startDate: m.startDate || undefined,
              endDate: m.endDate || undefined
            }),
            search: { mode: 'match' }
          }))
        })
      }

      default:
        return apiError(`Unsupported resource type: ${resourceType}`, 400)
    }
  } catch (error) {
    console.error('FHIR GET error:', error)
    return apiError('FHIR request failed', 500)
  }
}

// Create FHIR resource
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }
    if (!['ADMIN', 'PROVIDER'].includes(session.user.role)) return apiError('FHIR write role required', 403)

    const body = await request.json()
    const { resourceType } = body

    switch (resourceType) {
      case 'Patient': {
        return apiError('Direct Patient creation is disabled; use governed FHIR Bundle import with identity matching and consent', 409)
      }

      default:
        return apiError(`Cannot create resource type: ${resourceType}`, 400)
    }
  } catch (error) {
    console.error('FHIR POST error:', error)
    return apiError('FHIR create failed', 500)
  }
}
