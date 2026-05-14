import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateSOAPNote, isDemoMode } from '@/lib/ai'
import { apiResponse, apiError } from '@/lib/utils'
import { aiRateLimiter, logAIResult, AI_MODEL } from '@/lib/ai-utils'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const rl = aiRateLimiter(session.user.id)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: Math.ceil(rl.resetIn / 1000) },
        { status: 429 }
      )
    }

    const { transcription, patientContext } = await request.json()
    if (!transcription) {
      return apiError('Transcription is required', 400)
    }

    const soapNote = await generateSOAPNote(transcription, patientContext)

    await logAIResult({
      feature: 'scribe',
      userId: session.user.id,
      practiceId: session.user.practiceId || null,
      input: { length: transcription.length },
      output: soapNote,
      model: AI_MODEL,
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return apiResponse({
      ...soapNote,
      _meta: { demoMode: isDemoMode(), model: AI_MODEL, rateLimit: { remaining: rl.remaining } },
    })
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
