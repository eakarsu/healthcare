import OpenAI from 'openai'
import { AI_MODEL, parseAIJson } from './ai-utils'

const apiKey = process.env.OPENROUTER_API_KEY
const openai = apiKey && apiKey.length > 10 ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || '',
    'X-Title': 'Healthcare Practice AI',
  },
}) : null
const model = process.env.OPENROUTER_MODEL || AI_MODEL

export async function generateSOAPNote(transcription: string, patientContext?: {
  allergies?: string[]
  medications?: string[]
  conditions?: string[]
}): Promise<{
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
}> {
  if (!openai) throw new Error('Clinical AI is unavailable; no draft was generated')
  const context = {
    allergies: patientContext?.allergies || [],
    medications: patientContext?.medications || [],
    conditions: patientContext?.conditions || [],
  }
  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Create an unsigned clinical SOAP draft. Use only the supplied transcription and context. Never invent vitals, examination findings, diagnoses, medications, or follow-up facts. Return JSON with exactly chiefComplaint, subjective, objective, assessment, and plan string fields. Mark missing information explicitly.',
        },
        {
          role: 'user',
          content: JSON.stringify({ transcription, patientContext: context }),
        },
      ],
    })
    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Provider returned no output')
    const parsed = parseAIJson<Record<string, unknown>>(content)
    const fields = ['chiefComplaint', 'subjective', 'objective', 'assessment', 'plan'] as const
    if (!parsed || Object.keys(parsed).some(key => !fields.includes(key as typeof fields[number])) || fields.some(field => typeof parsed[field] !== 'string')) {
      throw new Error('Provider output failed the SOAP contract')
    }
    return parsed as { chiefComplaint: string; subjective: string; objective: string; assessment: string; plan: string }
  } catch (error) {
    console.error('Clinical AI provider failed', error instanceof Error ? error.message : 'unknown error')
    throw new Error('Clinical AI failed; no draft was generated')
  }
}
