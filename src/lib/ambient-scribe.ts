// Real-time Ambient Scribe with Live Transcription
import OpenAI from 'openai'

const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10

const openai = hasValidApiKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Healthcare Practice AI',
  },
}) : null

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

// Speaker diarization result
interface SpeakerSegment {
  speaker: 'PROVIDER' | 'PATIENT' | 'UNKNOWN'
  text: string
  startTime: number
  endTime: number
  confidence: number
}

// Real-time transcription chunk
interface TranscriptionChunk {
  text: string
  timestamp: number
  isFinal: boolean
  speakerSegments?: SpeakerSegment[]
}

// Process audio chunk for transcription (using Deepgram or similar)
export async function processAudioChunk(
  audioData: string, // Base64 encoded audio
  sessionId: string,
  options?: {
    language?: string
    enableDiarization?: boolean
  }
): Promise<TranscriptionChunk> {
  // In production, this would connect to Deepgram's streaming API
  // For now, return a mock response
  const mockTranscription: TranscriptionChunk = {
    text: 'Patient reports experiencing headaches for the past three days...',
    timestamp: Date.now(),
    isFinal: false,
    speakerSegments: options?.enableDiarization ? [
      {
        speaker: 'PATIENT',
        text: 'Patient reports experiencing headaches for the past three days',
        startTime: 0,
        endTime: 3000,
        confidence: 0.92
      }
    ] : undefined
  }

  return mockTranscription
}

// Perform speaker diarization on transcript
export async function diarizeSpeakers(
  transcript: string,
  audioMetadata?: { duration: number }
): Promise<SpeakerSegment[]> {
  if (!openai) {
    // Return mock diarization
    return [
      {
        speaker: 'PROVIDER',
        text: 'What brings you in today?',
        startTime: 0,
        endTime: 2000,
        confidence: 0.95
      },
      {
        speaker: 'PATIENT',
        text: transcript.slice(0, 100),
        startTime: 2000,
        endTime: 8000,
        confidence: 0.88
      }
    ]
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical transcription analyst. Analyze the following clinical conversation transcript and identify speaker segments.
Label each segment as either PROVIDER or PATIENT based on context clues:
- Medical questions and examinations are typically from PROVIDER
- Symptom descriptions and responses are typically from PATIENT

Return ONLY a JSON array with the following structure:
[
  {
    "speaker": "PROVIDER" | "PATIENT",
    "text": "The spoken text",
    "confidence": 0.0-1.0
  }
]`
        },
        {
          role: 'user',
          content: `Diarize this clinical transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid format')

    const segments = JSON.parse(jsonMatch[0])
    let currentTime = 0
    const avgWordsPerSecond = 2.5

    return segments.map((seg: { speaker: string; text: string; confidence: number }) => {
      const words = seg.text.split(' ').length
      const duration = (words / avgWordsPerSecond) * 1000
      const segment: SpeakerSegment = {
        speaker: seg.speaker as 'PROVIDER' | 'PATIENT',
        text: seg.text,
        startTime: currentTime,
        endTime: currentTime + duration,
        confidence: seg.confidence || 0.85
      }
      currentTime += duration
      return segment
    })
  } catch (error) {
    console.error('Diarization error:', error)
    return [{
      speaker: 'UNKNOWN',
      text: transcript,
      startTime: 0,
      endTime: audioMetadata?.duration || 0,
      confidence: 0.5
    }]
  }
}

// Generate SOAP note from diarized transcript in real-time
export async function generateRealtimeSOAPNote(
  speakerSegments: SpeakerSegment[],
  patientContext?: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    chiefComplaint?: string
  }
): Promise<{
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  confidence: number
}> {
  const transcript = speakerSegments
    .map(s => `[${s.speaker}]: ${s.text}`)
    .join('\n')

  if (!openai) {
    // Return mock SOAP note
    const patientText = speakerSegments
      .filter(s => s.speaker === 'PATIENT')
      .map(s => s.text)
      .join(' ')

    return {
      chiefComplaint: patientContext?.chiefComplaint || 'General visit',
      subjective: `Patient reports: ${patientText.slice(0, 200) || 'symptoms as discussed during the visit'}...`,
      objective: 'Vitals: BP 120/80, HR 72, Temp 98.6°F. General appearance: Alert and oriented.',
      assessment: 'Clinical findings consistent with patient reported symptoms.',
      plan: '1. Continue current management\n2. Follow-up as needed',
      confidence: 0.75
    }
  }

  try {
    const contextInfo = patientContext ? `
Patient Context:
- Known allergies: ${patientContext.allergies?.join(', ') || 'None documented'}
- Current medications: ${patientContext.medications?.join(', ') || 'None documented'}
- Active conditions: ${patientContext.conditions?.join(', ') || 'None documented'}
- Chief complaint: ${patientContext.chiefComplaint || 'Not specified'}
` : ''

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical scribe generating SOAP notes from clinical conversations.
The transcript includes speaker labels [PROVIDER] and [PATIENT].
${contextInfo}

Generate a professional SOAP note. Return ONLY a JSON object:
{
  "chiefComplaint": "Brief main reason for visit",
  "subjective": "Patient's reported symptoms from [PATIENT] segments",
  "objective": "Physical exam findings from [PROVIDER] segments",
  "assessment": "Clinical impressions based on the conversation",
  "plan": "Treatment plan discussed",
  "confidence": 0.0-1.0
}`
        },
        {
          role: 'user',
          content: `Generate SOAP note from this clinical conversation:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid format')

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('SOAP generation error:', error)
    throw error
  }
}

// Suggest ICD/CPT codes from real-time SOAP note
export async function suggestCodesFromSOAP(soapNote: {
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
}): Promise<{
  icdCodes: Array<{ code: string; description: string; confidence: number }>
  cptCodes: Array<{ code: string; description: string; confidence: number; emLevel?: string }>
}> {
  const clinicalText = `
Chief Complaint: ${soapNote.chiefComplaint}
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}
`

  if (!openai) {
    // Return mock codes based on keywords
    const icdCodes: Array<{ code: string; description: string; confidence: number }> = []
    const cptCodes: Array<{ code: string; description: string; confidence: number; emLevel?: string }> = []

    const lowerText = clinicalText.toLowerCase()

    if (lowerText.includes('headache')) {
      icdCodes.push({ code: 'R51.9', description: 'Headache, unspecified', confidence: 0.88 })
    }
    if (lowerText.includes('hypertension') || lowerText.includes('blood pressure')) {
      icdCodes.push({ code: 'I10', description: 'Essential hypertension', confidence: 0.92 })
    }
    if (lowerText.includes('diabetes')) {
      icdCodes.push({ code: 'E11.9', description: 'Type 2 diabetes mellitus', confidence: 0.90 })
    }

    if (icdCodes.length === 0) {
      icdCodes.push({ code: 'Z00.00', description: 'General adult medical examination', confidence: 0.70 })
    }

    // Suggest E/M level based on complexity
    const complexity = clinicalText.length
    if (complexity > 1500) {
      cptCodes.push({ code: '99215', description: 'Office visit, high complexity', confidence: 0.85, emLevel: 'Level 5' })
    } else if (complexity > 800) {
      cptCodes.push({ code: '99214', description: 'Office visit, moderate complexity', confidence: 0.88, emLevel: 'Level 4' })
    } else {
      cptCodes.push({ code: '99213', description: 'Office visit, low complexity', confidence: 0.90, emLevel: 'Level 3' })
    }

    return { icdCodes, cptCodes }
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical coding specialist. Analyze the SOAP note and suggest appropriate ICD-10 and CPT codes.
Consider:
- Medical decision making complexity for E/M level selection
- Specificity of ICD-10 codes
- Documentation support for each code

Return ONLY a JSON object:
{
  "icdCodes": [{"code": "X00.0", "description": "Description", "confidence": 0.95}],
  "cptCodes": [{"code": "99214", "description": "Description", "confidence": 0.90, "emLevel": "Level 4"}]
}`
        },
        {
          role: 'user',
          content: `Suggest billing codes for:\n\n${clinicalText}`
        }
      ],
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid format')

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Code suggestion error:', error)
    throw error
  }
}

// WebSocket message types for real-time streaming
export type AmbientWebSocketMessage =
  | { type: 'START_SESSION'; sessionId: string; patientId: string; encounterId?: string }
  | { type: 'AUDIO_CHUNK'; data: string; timestamp: number }
  | { type: 'TRANSCRIPTION_UPDATE'; text: string; isFinal: boolean; speakers?: SpeakerSegment[] }
  | { type: 'SOAP_UPDATE'; soapNote: { chiefComplaint: string; subjective: string; objective: string; assessment: string; plan: string } }
  | { type: 'CODE_SUGGESTION'; codes: { icdCodes: Array<{ code: string; description: string; confidence: number }>; cptCodes: Array<{ code: string; description: string; confidence: number }> } }
  | { type: 'END_SESSION' }
  | { type: 'ERROR'; message: string }
