import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return apiError('Unauthorized', 401)
  if (!['PROVIDER', 'ADMIN'].includes(session.user.role)) return apiError('Clinician role required', 403)
  const body = await request.json()
  if (body.attestation !== 'I reviewed the source record, safety flags, and final note') return apiError('Explicit review attestation is required', 422)

  const encounter = await prisma.encounter.findFirst({
    where: { id: (await params).id, patient: { practiceId: session.user.practiceId } },
  })
  if (!encounter || encounter.status !== 'PENDING_REVIEW' || !encounter.aiDraftNote) return apiError('Pending clinical draft not found', 409)
  const draft = JSON.parse(encounter.aiDraftNote) as {
    note: { chiefComplaint: string; subjective: string; objective: string; assessment: string; plan: string }
    safety: { blockers: Array<{ code: string }> }
  }
  const resolved = new Set<string>(body.resolvedBlockerCodes || [])
  const unresolved = draft.safety.blockers.map(item => item.code).filter(code => !resolved.has(code))
  if (unresolved.length) return apiError(`Unresolved safety blockers: ${unresolved.join(', ')}`, 409)
  const finalNote = body.finalNote || draft.note
  for (const field of ['subjective', 'objective', 'assessment', 'plan']) {
    if (!finalNote[field]?.trim()) return apiError(`Final ${field} is required`, 422)
  }

  const signedAt = new Date()
  const [updated] = await prisma.$transaction([
    prisma.encounter.update({ where: { id: encounter.id }, data: {
      chiefComplaint: finalNote.chiefComplaint, subjective: finalNote.subjective, objective: finalNote.objective,
      assessment: finalNote.assessment, plan: finalNote.plan, status: 'SIGNED', signedBy: session.user.id, signedAt,
    } }),
    prisma.auditLog.create({ data: {
      userId: session.user.id, action: 'VERIFY', entity: 'Encounter', entityId: encounter.id,
      patientId: encounter.patientId, phiAccessed: true,
      changes: { clinicalReview: true, signedAt: signedAt.toISOString(), resolvedBlockerCodes: [...resolved] },
    } }),
  ])
  return apiResponse({ id: updated.id, status: updated.status, signedAt: updated.signedAt })
}
