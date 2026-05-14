// DICOM viewer with AI image triage (uses vision-capable model on a single frame URL).
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import OpenAI from 'openai'

const hasKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10
const openai = hasKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null
const MODEL = process.env.OPENROUTER_VISION_MODEL || 'anthropic/claude-3-5-sonnet-20241022'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { frameUrl, modality, clinicalQuestion } = await request.json()
  if (!frameUrl) return NextResponse.json({ error: 'frameUrl required' }, { status: 400 })
  if (!openai) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const r = await openai.chat.completions.create({
    model: MODEL,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Modality: ${modality || 'unknown'}. Question: ${clinicalQuestion || 'screening'}. Return JSON {"impression":string,"findings":[string],"urgency":"routine|urgent|stat","follow_up":string}. NOTE: NOT diagnostic; physician review required.`
        },
        { type: 'image_url', image_url: { url: frameUrl } }
      ] as any
    }],
    max_tokens: 600,
    temperature: 0.1
  })

  let parsed: any
  try { parsed = JSON.parse(r.choices[0].message.content!.match(/\{[\s\S]*\}/)![0]) }
  catch { parsed = { raw: r.choices[0].message.content } }
  return NextResponse.json({ ...parsed, disclaimer: 'AI triage only; not a diagnostic finding.' })
}
