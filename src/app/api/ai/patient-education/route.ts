// Patient education generator (per condition, per literacy level, multilingual).
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import OpenAI from 'openai'

const hasKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10
const openai = hasKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!openai) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  const { condition, literacyGrade = 6, language = 'en', length = 'medium' } = await request.json()
  if (!condition) return NextResponse.json({ error: 'condition required' }, { status: 400 })

  const r = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You produce patient education content. Target grade ${literacyGrade} reading level, language ${language}.
Return JSON {"title":string,"summary":string,"do":[string],"do_not":[string],"red_flags":[string],"when_to_call":[string],"reading_grade_estimate":number}.`
      },
      { role: 'user', content: `Condition: ${condition}\nLength: ${length}` }
    ],
    max_tokens: 1200,
    temperature: 0.3
  })

  let parsed: any
  try { parsed = JSON.parse(r.choices[0].message.content!.match(/\{[\s\S]*\}/)![0]) }
  catch { parsed = { raw: r.choices[0].message.content } }
  return NextResponse.json(parsed)
}
