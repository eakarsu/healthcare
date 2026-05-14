import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { predictDenialRisk, isDemoMode } from '@/lib/ai'
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

    const { diagnosis, procedures, insurance, totalCharges, placeOfService } = await request.json()

    if (!diagnosis || !procedures || !insurance) {
      return apiError('Diagnosis, procedures, and insurance are required', 400)
    }

    const prediction = await predictDenialRisk({
      diagnosis,
      procedures,
      insurance,
      totalCharges: totalCharges || 0,
      placeOfService,
    })

    await logAIResult({
      feature: 'denial-predictor',
      userId: session.user.id,
      practiceId: session.user.practiceId || null,
      input: { diagnosis, procedures, insurance, totalCharges, placeOfService },
      output: prediction,
      model: AI_MODEL,
      durationMs: Date.now() - startedAt,
      success: true,
    })

    return apiResponse({
      ...prediction,
      _meta: { demoMode: isDemoMode(), model: AI_MODEL, rateLimit: { remaining: rl.remaining } },
    })
  } catch (error) {
    console.error('Failed to predict denial risk:', error)
    await logAIResult({
      feature: 'denial-predictor',
      input: {},
      output: {},
      durationMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    })
    return apiError('Failed to predict denial risk', 500)
  }
}
