import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateSOAPNote } from '@/lib/ai'
import { apiResponse, apiError } from '@/lib/utils'
import { aiRateLimiter, logAIResult, AI_MODEL } from '@/lib/ai-utils'
import { prisma } from '@/lib/prisma'
import { evaluateClinicalDraft, hasValidConsent } from '@/lib/clinical-governance'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }
    if (!['PROVIDER', 'ADMIN'].includes(session.user.role)) {
      return apiError('Clinician role required', 403)
    }

    const rl = aiRateLimiter(session.user.id)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: Math.ceil(rl.resetIn / 1000) },
        { status: 429 }
      )
    }

    const { transcription, patientContext, patientId, encounterId, proposedMedications = [] } = await request.json()
    if (!transcription || transcription.length > 50_000 || !patientId || !encounterId) {
      return apiError('Transcription (max 50,000 characters), patientId, and encounterId are required', 400)
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, practiceId: session.user.practiceId },
      include: { allergies: true, medications: true, conditions: true, consents: true },
    })
    if (!patient || !hasValidConsent(patient.consents, 'TREATMENT_CONSENT')) return apiError('Patient not found or treatment consent is not active', 403)
    const encounter = await prisma.encounter.findFirst({ where: { id: encounterId, patientId, patient: { practiceId: session.user.practiceId } } })
    if (!encounter) return apiError('Encounter not found', 404)

    const soapNote = await generateSOAPNote(transcription, patientContext)
    const safety = evaluateClinicalDraft({
      allergies: patient.allergies, medications: patient.medications, conditions: patient.conditions,
      proposedMedications, subjective: soapNote.subjective, assessment: soapNote.assessment, plan: soapNote.plan,
      vitals: {
        systolic: encounter.bloodPressureSystolic || undefined, diastolic: encounter.bloodPressureDiastolic || undefined,
        heartRate: encounter.heartRate || undefined, oxygenSaturation: encounter.oxygenSaturation || undefined,
      },
    })
    const provenance = {
      model: AI_MODEL, generatedAt: new Date().toISOString(),
      inputHash: crypto.createHash('sha256').update(transcription).digest('hex'),
      userId: session.user.id, encounterId, patientId,
    }
    const draft = { note: soapNote, safety, provenance, status: 'UNSIGNED_CLINICAL_DRAFT' }
    await prisma.$transaction([
      prisma.encounter.update({ where: { id: encounterId }, data: { aiDraftNote: JSON.stringify(draft), status: 'PENDING_REVIEW' } }),
      prisma.aIResult.create({ data: {
        feature: 'scribe', userId: session.user.id, practiceId: session.user.practiceId, patientId,
        input: { length: transcription.length, inputHash: provenance.inputHash }, output: draft,
        model: AI_MODEL, durationMs: Date.now() - startedAt, success: true,
      } }),
      prisma.auditLog.create({ data: {
        userId: session.user.id, action: 'CREATE', entity: 'ClinicalDraft', entityId: encounterId,
        patientId, phiAccessed: true, changes: { disposition: safety.disposition, blockerCodes: safety.blockers.map(item => item.code) },
      } }),
    ])

    return apiResponse({ ...draft, _meta: { rateLimit: { remaining: rl.remaining } } }, 202)
  } catch (error) {
    console.error('Failed to generate SOAP note:', error)
    await logAIResult({
      feature: 'scribe',
      input: {},
      output: {},
      durationMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    })
    return apiError('Failed to generate SOAP note', 500)
  }
}
