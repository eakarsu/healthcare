// Telehealth + ambient scribe + live clinical decision support.
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
  const { transcript, patientContext, vitals } = await request.json()
  if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 })
  if (!openai) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const r = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an ambient clinical scribe + decision support assistant. Return JSON {"soap":{"S":string,"O":string,"A":string,"P":string},"differentials":[string],"red_flags":[string],"orders_suggested":[string],"patient_summary":string}.'
      },
      {
        role: 'user',
        content: `Patient: ${JSON.stringify(patientContext || {})}\nVitals: ${JSON.stringify(vitals || {})}\n\nTranscript:\n${transcript.slice(0, 12000)}`
      }
    ],
    max_tokens: 1800,
    temperature: 0.2
  })

  let parsed: any
  try { parsed = JSON.parse(r.choices[0].message.content!.match(/\{[\s\S]*\}/)![0]) }
  catch { parsed = { raw: r.choices[0].message.content } }
  return NextResponse.json(parsed)
}
