import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import OpenAI from 'openai'
import { AI_MODEL, aiRateLimiter, parseAIJson, logAIResult } from '@/lib/ai-utils'

/**
 * POST /api/ai/ambient-scribe
 *
 * Accepts the text transcript of a clinical encounter (from Whisper, Deepgram, or similar)
 * and returns a fully structured SOAP note plus suggested billing codes.
 *
 * Rate limited at 15 req/15 min by middleware.
 * Requires authenticated session (practiceId enforced for multi-tenancy).
 */

const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10

const openai = hasValidApiKey
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Healthcare Practice AI - Ambient Scribe',
      },
    })
  : null

const MODEL = process.env.OPENROUTER_MODEL || AI_MODEL

interface SOAPNote {
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  diagnoses: { code: string; description: string; confidence: number }[]
  procedures: { code: string; description: string; confidence: number }[]
  followUpPlan: string
  patientInstructions: string
}

async function generateAmbientSOAP(
  transcript: string,
  patientContext: {
    conditions: string[]
    medications: string[]
    allergies: string[]
  }
): Promise<SOAPNote> {
  if (!openai) throw new Error('AI not configured')

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert medical scribe AI. Your task is to convert a raw clinical encounter transcript into a structured SOAP note with billing codes.

Patient Context:
- Active conditions: ${patientContext.conditions.join(', ') || 'None documented'}
- Current medications: ${patientContext.medications.join(', ') || 'None documented'}
- Known allergies: ${patientContext.allergies.join(', ') || 'NKDA'}

Instructions:
1. Extract the SOAP components from the natural language transcript
2. Use professional medical terminology
3. Infer appropriate ICD-10 diagnosis codes and CPT procedure codes from the clinical content
4. Generate clear patient-facing follow-up instructions (plain language)
5. Be thorough — include all relevant clinical details mentioned in the transcript

Return ONLY a JSON object in this exact structure:
{
  "chiefComplaint": "Brief chief complaint",
  "subjective": "Full subjective narrative: HPI, ROS, relevant history",
  "objective": "Physical exam findings, vitals mentioned, lab/imaging results referenced",
  "assessment": "Clinical assessment: diagnoses, differential if relevant",
  "plan": "Treatment plan: medications, procedures, referrals, follow-up",
  "diagnoses": [
    {"code": "ICD-10 code", "description": "Description", "confidence": 0-100}
  ],
  "procedures": [
    {"code": "CPT code", "description": "Description", "confidence": 0-100}
  ],
  "followUpPlan": "When to follow up and under what circumstances",
  "patientInstructions": "Plain-language instructions for the patient"
}`,
      },
      {
        role: 'user',
        content: `Convert this clinical encounter transcript into a SOAP note:\n\n${transcript}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2500,
  })

  const content = response.choices[0]?.message?.content || ''
  const parsed = parseAIJson<SOAPNote>(content)
  if (!parsed) throw new Error('Invalid AI response format')
  return parsed
}

function mockSOAPFallback(transcript: string): SOAPNote {
  const lower = transcript.toLowerCase()
  let chiefComplaint = 'Follow-up visit'
  if (lower.includes('headache')) chiefComplaint = 'Headache'
  else if (lower.includes('chest pain')) chiefComplaint = 'Chest pain'
  else if (lower.includes('diabetes') || lower.includes('blood sugar')) chiefComplaint = 'Diabetes management'
  else if (lower.includes('hypertension') || lower.includes('blood pressure')) chiefComplaint = 'Hypertension management'
  else if (lower.includes('cough') || lower.includes('cold')) chiefComplaint = 'Upper respiratory symptoms'
  else if (lower.includes('back pain')) chiefComplaint = 'Back pain'

  return {
    chiefComplaint,
    subjective: `Patient presents with ${chiefComplaint.toLowerCase()}. ${transcript.slice(0, 300)}${transcript.length > 300 ? '...' : ''}`,
    objective: 'Vital signs: BP 120/80, HR 72, RR 16, Temp 98.6°F, SpO2 98%. General: Alert and oriented, no acute distress.',
    assessment: `1. ${chiefComplaint} — clinical presentation consistent with history. Patient is stable.`,
    plan: '1. Continue current medications\n2. Lifestyle modifications discussed\n3. Follow-up in 4-6 weeks or sooner if symptoms worsen',
    diagnoses: [{ code: 'Z00.00', description: 'General adult medical examination', confidence: 70 }],
    procedures: [{ code: '99213', description: 'Office visit, established patient, low complexity', confidence: 75 }],
    followUpPlan: 'Follow up in 4-6 weeks or sooner if symptoms worsen or new symptoms develop.',
    patientInstructions: 'Take medications as prescribed. Rest and stay hydrated. Call the office if symptoms worsen.',
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const practiceId = session.user.practiceId
    if (!practiceId) {
      return apiError('Practice context required', 403)
    }

    // Per-user AI rate limiter (defence-in-depth on top of middleware)
    const rl = aiRateLimiter(session.user.id)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'AI rate limit exceeded',
          retryAfter: Math.ceil(rl.resetIn / 1000),
          message: `Try again in ${Math.ceil(rl.resetIn / 60000)} minute(s)`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { transcript, patientId, encounterId } = body

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
      return apiError('transcript is required and must be at least 20 characters', 400)
    }

    // Build patient context for better AI accuracy (optional — uses it if patientId provided)
    let patientContext = { conditions: [] as string[], medications: [] as string[], allergies: [] as string[] }

    if (patientId) {
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, practiceId }, // practiceId ensures tenant isolation
        include: {
          conditions: { select: { name: true } },
          medications: { select: { name: true } },
          allergies: { select: { allergen: true } },
        },
      })

      if (patient) {
        patientContext = {
          conditions: patient.conditions.map(c => c.name),
          medications: patient.medications.map(m => m.name),
          allergies: patient.allergies.map(a => a.allergen),
        }
      }
    }

    let soapNote: SOAPNote
    let aiPowered = false

    if (openai) {
      try {
        soapNote = await generateAmbientSOAP(transcript.trim(), patientContext)
        aiPowered = true
      } catch (err) {
        console.warn('AI SOAP generation failed, using fallback:', err)
        soapNote = mockSOAPFallback(transcript)
      }
    } else {
      console.log('OpenRouter not configured — using demo SOAP note')
      soapNote = mockSOAPFallback(transcript)
    }

    // Optionally persist the SOAP note to the encounter if encounterId is provided
    if (encounterId && aiPowered) {
      try {
        await prisma.encounter.updateMany({
          where: {
            id: encounterId,
            // Ensure encounter belongs to this practice via provider
            provider: { practiceId },
          },
          data: {
            // Use aiDraftNote field to store structured SOAP (pending provider review)
            aiDraftNote: JSON.stringify(soapNote),
            chiefComplaint: soapNote.chiefComplaint,
            subjective: soapNote.subjective,
            objective: soapNote.objective,
            assessment: soapNote.assessment,
            plan: soapNote.plan,
          },
        })
      } catch (err) {
        // Non-fatal — just log it
        console.warn('Could not persist SOAP note to encounter:', err)
      }
    }

    await logAIResult({
      feature: 'ambient-scribe',
      userId: session.user.id,
      practiceId,
      patientId: patientId || null,
      input: { transcriptLength: transcript.length, encounterId: encounterId || null },
      output: { aiPowered, soapNote },
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return apiResponse({
      ...soapNote,
      meta: {
        aiPowered,
        demoMode: !aiPowered,
        model: aiPowered ? MODEL : 'rule-based-fallback',
        transcriptLength: transcript.length,
        patientContextUsed: !!patientId,
        rateLimit: { remaining: rl.remaining, resetIn: rl.resetIn },
      },
    })
  } catch (error) {
    console.error('Ambient scribe error:', error)
    await logAIResult({
      feature: 'ambient-scribe',
      input: { error: 'top-level' },
      output: { message: error instanceof Error ? error.message : 'unknown' },
      durationMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    })
    return apiError('Failed to generate SOAP note', 500)
  }
}
