/**
 * Shared AI utilities for the healthcare practice platform.
 *
 * - Standard model: anthropic/claude-3-5-sonnet-20241022
 * - aiRateLimiter: 20/hr per user (defence-in-depth + per-route enforcement)
 * - parseAIJson: 3-strategy parser
 * - logAIResult: persists every AI call to the AIResult JSONB log
 */
import { prisma } from './prisma'

export const AI_MODEL =
  process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022'

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// In-process rate limiter store (defence-in-depth on top of middleware)
const _rateStore = new Map<string, { count: number; resetAt: number }>()

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of _rateStore.entries()) {
      if (v.resetAt < now) _rateStore.delete(k)
    }
  }, 5 * 60 * 1000)
}

export function aiRateLimiter(userId: string): {
  allowed: boolean
  remaining: number
  resetIn: number
} {
  const max = 20
  const window = 60 * 60 * 1000
  const now = Date.now()
  const key = `ai:${userId}`
  const entry = _rateStore.get(key)
  if (!entry || entry.resetAt < now) {
    _rateStore.set(key, { count: 1, resetAt: now + window })
    return { allowed: true, remaining: max - 1, resetIn: window }
  }
  entry.count++
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }
  return { allowed: true, remaining: max - entry.count, resetIn: entry.resetAt - now }
}

/**
 * 3-strategy parser:
 *   1. JSON.parse(raw)
 *   2. Extract from ```json ... ``` block
 *   3. First {...} or [...] block
 */
export function parseAIJson<T = unknown>(text: string): T | null {
  if (!text || typeof text !== 'string') return null
  try {
    return JSON.parse(text) as T
  } catch {
    /* continue */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenced && fenced[1]) {
    try {
      return JSON.parse(fenced[1]) as T
    } catch {
      /* continue */
    }
  }
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) {
    try {
      return JSON.parse(obj[0]) as T
    } catch {
      /* continue */
    }
  }
  const arr = text.match(/\[[\s\S]*\]/)
  if (arr) {
    try {
      return JSON.parse(arr[0]) as T
    } catch {
      /* continue */
    }
  }
  return null
}

/**
 * Call OpenRouter with the standard healthcare-AI configuration.
 */
export async function callOpenRouter(
  prompt: string,
  systemPrompt?: string,
  options: { temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: prompt },
  ]
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Healthcare Practice AI',
    },
    body: JSON.stringify({
      model: options.model || AI_MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2000,
    }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error: ${err}`)
  }
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Persist an AI call (input/output JSONB) for audit + analytics.
 * Failures are swallowed.
 */
export async function logAIResult(params: {
  feature: string
  userId?: string | null
  practiceId?: string | null
  patientId?: string | null
  input: unknown
  output: unknown
  model?: string
  durationMs?: number
  success?: boolean
  errorMessage?: string | null
}): Promise<void> {
  try {
    // The AIResult model is added in this migration set; if not yet migrated it is
    // safe to no-op.
    const anyPrisma = prisma as unknown as { aIResult?: { create: (args: unknown) => Promise<unknown> } }
    if (!anyPrisma.aIResult) return
    await anyPrisma.aIResult.create({
      data: {
        feature: params.feature,
        userId: params.userId ?? null,
        practiceId: params.practiceId ?? null,
        patientId: params.patientId ?? null,
        input: params.input as never,
        output: params.output as never,
        model: params.model || AI_MODEL,
        durationMs: params.durationMs ?? null,
        success: params.success ?? true,
        errorMessage: params.errorMessage ?? null,
      },
    })
  } catch (err) {
    console.error('logAIResult failed:', err)
  }
}
