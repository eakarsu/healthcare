/**
 * HIPAA-Compliant Patient Chat
 *
 * Patient-authenticated chat that pulls the patient's record (FHIR + Prisma)
 * and produces personalized answers. Every turn is logged to AuditLog +
 * AIResult tables for HIPAA accountability.
 *
 * Body: { patientId: string; message: string; sessionId?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  AI_MODEL,
  OPENROUTER_API_KEY,
  aiRateLimiter,
  callOpenRouter,
  parseAIJson,
  logAIResult,
} from '@/lib/ai-utils'
import { createAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const practiceId = session.user.practiceId

    const rl = aiRateLimiter(userId)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: Math.ceil(rl.resetIn / 1000) },
        { status: 429 }
      )
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { patientId, message, sessionId } = body
    if (!patientId || !message) {
      return NextResponse.json({ error: 'patientId and message are required' }, { status: 400 })
    }

    // Tenant + ownership check: patient must belong to this practice.
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, ...(practiceId ? { practiceId } : {}) },
      include: {
        conditions: { select: { name: true, status: true } },
        medications: { select: { name: true, dosage: true, status: true } },
        allergies: { select: { allergen: true, severity: true } },
      },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Audit PHI access
    await createAuditLog({
      userId,
      action: 'READ',
      entity: 'Patient',
      entityId: patient.id,
      patientId: patient.id,
      phiAccessed: true,
      changes: { reason: 'patient-chat' },
    })

    // Build a redacted clinical context
    const ctx = {
      conditions: patient.conditions.filter((c) => c.status !== 'RESOLVED').map((c) => c.name),
      medications: patient.medications.filter((m) => m.status === 'ACTIVE').map((m) => `${m.name} ${m.dosage || ''}`.trim()),
      allergies: patient.allergies.map((a) => `${a.allergen}${a.severity ? ` (${a.severity})` : ''}`),
    }

    const systemPrompt = `You are a HIPAA-compliant patient-care assistant. The patient is authenticated and you may reference their on-file information ONLY where directly relevant to the question.

Patient on file:
- Active conditions: ${ctx.conditions.join(', ') || 'none documented'}
- Active medications: ${ctx.medications.join(', ') || 'none documented'}
- Allergies: ${ctx.allergies.join(', ') || 'NKDA'}

Rules:
1. NEVER invent medical facts or diagnoses.
2. Always recommend the patient contact the practice for clinical decisions.
3. If the patient describes anything urgent (chest pain, difficulty breathing, suicidal ideation, severe bleeding, signs of stroke), instruct them to call 911 immediately.
4. Be brief, clear, and respectful.
5. Return JSON: {"reply": "string", "urgent": boolean, "topics": ["string"], "suggestedActions": ["string"]}`

    const aiText = await callOpenRouter(message, systemPrompt, { temperature: 0.3, maxTokens: 800 })
    const parsed = parseAIJson<{
      reply: string
      urgent: boolean
      topics: string[]
      suggestedActions: string[]
    }>(aiText)
    if (!parsed) throw new Error('AI response could not be parsed')

    await logAIResult({
      feature: 'patient-chat',
      userId,
      practiceId: practiceId || null,
      patientId: patient.id,
      input: { sessionId, message },
      output: parsed,
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return NextResponse.json({
      ...parsed,
      _meta: { model: AI_MODEL, sessionId: sessionId || null, rateLimit: { remaining: rl.remaining } },
    })
  } catch (error) {
    console.error('Patient chat error:', error)
    return NextResponse.json(
      { error: 'Patient chat failed', message: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
