// Revenue-cycle automation agent (identify billing errors, denial appeals).
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const hasKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10
const openai = hasKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { action } = body

  if (action === 'scan-errors') {
    let claims: any[] = body.claims
    if (!claims) {
      try { claims = await (prisma as any).claim.findMany({ take: 200 }) } catch { claims = [] }
    }
    const flagged: any[] = []
    for (const c of claims) {
      const issues: string[] = []
      if (!c.diagnosisCode && !c.diagnosis_code) issues.push('missing diagnosis code')
      if (!c.cptCode && !c.cpt_code) issues.push('missing CPT code')
      if (c.amount && c.amount < 0) issues.push('negative amount')
      if (issues.length) flagged.push({ id: c.id, issues })
    }
    return NextResponse.json({ scanned: claims.length, flagged })
  }

  if (action === 'draft-appeal') {
    if (!openai) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    const { claim, denialReason } = body
    if (!claim || !denialReason) return NextResponse.json({ error: 'claim and denialReason required' }, { status: 400 })
    const r = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Draft a payer appeal letter. Cite medical necessity and CPT/ICD justification. Output Markdown.' },
        { role: 'user', content: `Claim: ${JSON.stringify(claim)}\nDenial reason: ${denialReason}` }
      ],
      max_tokens: 1200
    })
    return NextResponse.json({ appeal: r.choices[0]?.message?.content })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
