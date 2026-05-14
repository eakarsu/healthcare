import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { suggestBillingCodes, isDemoMode } from '@/lib/ai'
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

    const { clinicalNote } = await request.json()
    if (!clinicalNote) {
      return apiError('Clinical note is required', 400)
    }

    const suggestions = await suggestBillingCodes(clinicalNote)

    await logAIResult({
      feature: 'billing-coder',
      userId: session.user.id,
      practiceId: session.user.practiceId || null,
      input: { length: clinicalNote.length },
      output: suggestions,
      model: AI_MODEL,
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return apiResponse({
      ...suggestions,
      _meta: { demoMode: isDemoMode(), model: AI_MODEL, rateLimit: { remaining: rl.remaining } },
    })
  } catch (error) {
    console.error('Failed to suggest billing codes:', error)
    await logAIResult({
      feature: 'billing-coder',
      input: {},
      output: {},
      durationMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    })
    return apiError('Failed to suggest billing codes', 500)
  }
}
