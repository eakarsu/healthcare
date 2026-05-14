/**
 * POST /api/ai/transcribe — multipart audio upload → text via Deepgram (or
 * Whisper fallback). Used to feed the ambient-scribe pipeline.
 *
 * Form data: { audio: File }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { transcribeAudio } from '@/lib/ai'
import { aiRateLimiter, logAIResult } from '@/lib/ai-utils'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = aiRateLimiter(session.user.id)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: Math.ceil(rl.resetIn / 1000) },
        { status: 429 }
      )
    }

    const form = await request.formData()
    const file = form.get('audio') as File | null
    if (!file) {
      return NextResponse.json({ error: 'audio file required' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const transcript = await transcribeAudio(buf, file.type || 'audio/wav')

    await logAIResult({
      feature: 'transcribe',
      userId: session.user.id,
      practiceId: session.user.practiceId || null,
      input: { fileName: file.name, fileSize: buf.length, mime: file.type },
      output: { transcriptLength: transcript.length },
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return NextResponse.json({ transcript, _meta: { rateLimit: { remaining: rl.remaining } } })
  } catch (error) {
    console.error('Transcribe error:', error)
    await logAIResult({
      feature: 'transcribe',
      input: {},
      output: {},
      durationMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    })
    return NextResponse.json(
      { error: 'Transcription failed', message: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
