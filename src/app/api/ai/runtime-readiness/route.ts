import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { prompt } = await request.json()
    if (typeof prompt !== 'string' || !prompt.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL
    const baseUrl = process.env.OPENROUTER_BASE_URL
    if (!apiKey || !model || !baseUrl) return NextResponse.json({ error: 'OpenRouter runtime is not configured' }, { status: 503 })
    const provider = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'Review healthcare-practice runtime readiness without providing medical advice. Return concise risks, evidence gaps, next actions, uncertainty, and a mandatory clinician/privacy review gate.' },
          { role: 'user', content: prompt.trim() },
        ],
      }),
    })
    if (!provider.ok) return NextResponse.json({ error: `OpenRouter returned ${provider.status}` }, { status: 502 })
    const payload = await provider.json()
    const output = String(payload?.choices?.[0]?.message?.content || '').trim()
    if (!output) return NextResponse.json({ error: 'OpenRouter returned an empty response' }, { status: 502 })
    const result = await prisma.aIResult.create({
      data: {
        feature: 'runtime-readiness',
        model,
        userId: session.user.id,
        practiceId: session.user.practiceId,
        input: { prompt: prompt.trim() },
        output: { response: output, provider: 'openrouter', providerResponseId: payload.id || null },
        durationMs: Date.now() - startedAt,
        success: true,
      },
    })
    return NextResponse.json({ id: result.id, response: output, model, provider: 'openrouter', providerResponseId: payload.id || null })
  } catch (error) {
    console.error('Runtime readiness analysis failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Runtime readiness analysis failed' }, { status: 500 })
  }
}
