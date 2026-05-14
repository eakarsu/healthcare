import OpenAI from 'openai'

// Check if OpenRouter API key is configured
const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10

// Configure OpenAI client to use OpenRouter
const openai = hasValidApiKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Healthcare Practice AI',
  },
}) : null

// Use model from environment variable or default to Claude 3.5 Sonnet
import { AI_MODEL, parseAIJson } from './ai-utils'
const MODEL = process.env.OPENROUTER_MODEL || AI_MODEL

// Demo-mode flag exposed to callers so the UI can warn clinicians clearly.
export const DEMO_MODE = !openai
export function isDemoMode(): boolean {
  return DEMO_MODE
}

// Mock SOAP note generator for demo mode
function generateMockSOAPNote(transcription: string): {
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
} {
  const lowerTranscription = transcription.toLowerCase()

  let chiefComplaint = 'Follow-up visit'
  let condition = 'general health'

  if (lowerTranscription.includes('headache') || lowerTranscription.includes('head pain')) {
    chiefComplaint = 'Headache'
    condition = 'headache'
  } else if (lowerTranscription.includes('cough') || lowerTranscription.includes('cold')) {
    chiefComplaint = 'Upper respiratory symptoms'
    condition = 'upper respiratory infection'
  } else if (lowerTranscription.includes('back pain') || lowerTranscription.includes('back hurt')) {
    chiefComplaint = 'Lower back pain'
    condition = 'lower back pain'
  } else if (lowerTranscription.includes('diabetes') || lowerTranscription.includes('blood sugar')) {
    chiefComplaint = 'Diabetes management'
    condition = 'diabetes mellitus'
  } else if (lowerTranscription.includes('blood pressure') || lowerTranscription.includes('hypertension')) {
    chiefComplaint = 'Hypertension follow-up'
    condition = 'hypertension'
  } else if (lowerTranscription.includes('chest pain') || lowerTranscription.includes('chest')) {
    chiefComplaint = 'Chest discomfort'
    condition = 'chest pain'
  } else if (lowerTranscription.includes('anxiety') || lowerTranscription.includes('stress')) {
    chiefComplaint = 'Anxiety symptoms'
    condition = 'anxiety'
  }

  return {
    chiefComplaint,
    subjective: `Patient presents with ${condition}. ${transcription.slice(0, 200)}${transcription.length > 200 ? '...' : ''} Patient reports symptoms have been present and affecting daily activities. No significant changes in medical history since last visit.`,
    objective: `Vital Signs: BP 120/80 mmHg, HR 72 bpm, RR 16, Temp 98.6°F, SpO2 98% on room air. General: Alert and oriented, in no acute distress. HEENT: Normocephalic, PERRLA, oropharynx clear. Cardiovascular: Regular rate and rhythm, no murmurs. Respiratory: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, non-distended.`,
    assessment: `1. ${chiefComplaint} - ${condition.charAt(0).toUpperCase() + condition.slice(1)} presenting with symptoms as described. Clinical presentation consistent with ${condition}. Patient is stable and appropriate for outpatient management.`,
    plan: `1. Continue current medications as prescribed\n2. Lifestyle modifications discussed including diet and exercise\n3. Patient education provided regarding condition management\n4. Follow-up appointment in 4-6 weeks or sooner if symptoms worsen\n5. Return precautions reviewed with patient\n6. Labs ordered as clinically indicated`,
  }
}

// Mock billing codes for demo mode
function generateMockBillingCodes(clinicalNote: string): {
  icdCodes: Array<{ code: string; description: string; confidence: number }>
  cptCodes: Array<{ code: string; description: string; confidence: number }>
} {
  const lowerNote = clinicalNote.toLowerCase()

  const icdCodes: Array<{ code: string; description: string; confidence: number }> = []
  const cptCodes: Array<{ code: string; description: string; confidence: number }> = []

  // Determine ICD codes based on content
  if (lowerNote.includes('hypertension') || lowerNote.includes('blood pressure')) {
    icdCodes.push({ code: 'I10', description: 'Essential (primary) hypertension', confidence: 95 })
  }
  if (lowerNote.includes('diabetes')) {
    icdCodes.push({ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', confidence: 92 })
  }
  if (lowerNote.includes('headache')) {
    icdCodes.push({ code: 'R51.9', description: 'Headache, unspecified', confidence: 88 })
  }
  if (lowerNote.includes('back pain')) {
    icdCodes.push({ code: 'M54.5', description: 'Low back pain', confidence: 90 })
  }
  if (lowerNote.includes('anxiety')) {
    icdCodes.push({ code: 'F41.9', description: 'Anxiety disorder, unspecified', confidence: 85 })
  }
  if (lowerNote.includes('cough') || lowerNote.includes('respiratory')) {
    icdCodes.push({ code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: 87 })
  }

  // Default if no specific conditions found
  if (icdCodes.length === 0) {
    icdCodes.push({ code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', confidence: 80 })
  }

  // Determine CPT codes based on complexity
  if (lowerNote.length > 1000 || lowerNote.includes('comprehensive') || lowerNote.includes('detailed')) {
    cptCodes.push({ code: '99215', description: 'Office visit, established patient, high complexity', confidence: 85 })
  } else if (lowerNote.length > 500) {
    cptCodes.push({ code: '99214', description: 'Office visit, established patient, moderate complexity', confidence: 90 })
  } else {
    cptCodes.push({ code: '99213', description: 'Office visit, established patient, low complexity', confidence: 92 })
  }

  return { icdCodes, cptCodes }
}

// Mock denial risk prediction for demo mode
function generateMockDenialRisk(claimDetails: {
  diagnosis: string[]
  procedures: string[]
  insurance: string
  totalCharges: number
}): {
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: Array<{ factor: string; impact: string; recommendation: string }>
  overallRecommendation: string
} {
  const riskFactors: Array<{ factor: string; impact: string; recommendation: string }> = []
  let riskScore = 15 // Base risk

  // Check for high charges
  if (claimDetails.totalCharges > 5000) {
    riskScore += 20
    riskFactors.push({
      factor: 'High charge amount may trigger review',
      impact: 'MEDIUM',
      recommendation: 'Ensure documentation supports medical necessity for all services',
    })
  }

  // Check diagnosis-procedure alignment
  if (claimDetails.diagnosis.length === 0) {
    riskScore += 30
    riskFactors.push({
      factor: 'Missing diagnosis codes',
      impact: 'HIGH',
      recommendation: 'Add appropriate ICD-10 diagnosis codes to support procedures',
    })
  }

  // Check procedure count
  if (claimDetails.procedures.length > 3) {
    riskScore += 15
    riskFactors.push({
      factor: 'Multiple procedures may require modifier review',
      impact: 'MEDIUM',
      recommendation: 'Verify correct modifier usage to avoid bundling denials',
    })
  }

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = riskScore <= 30 ? 'LOW' : riskScore <= 60 ? 'MEDIUM' : 'HIGH'

  return {
    riskScore: Math.min(riskScore, 100),
    riskLevel,
    riskFactors: riskFactors.length > 0 ? riskFactors : [{
      factor: 'Standard claim with no significant risk factors identified',
      impact: 'LOW',
      recommendation: 'Proceed with claim submission',
    }],
    overallRecommendation: riskLevel === 'LOW'
      ? 'Claim appears ready for submission with low denial risk.'
      : riskLevel === 'MEDIUM'
        ? 'Review documentation before submission to address identified risk factors.'
        : 'High risk of denial. Address all risk factors before submission.',
  }
}

// Medical Scribe - Convert transcription to SOAP note
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
  if (!openai) {
    console.log('OpenRouter API key not configured - using demo mode')
    return generateMockSOAPNote(transcription)
  }

  const contextInfo = patientContext
    ? `
Patient Context:
- Known allergies: ${patientContext.allergies?.join(', ') || 'None documented'}
- Current medications: ${patientContext.medications?.join(', ') || 'None documented'}
- Active conditions: ${patientContext.conditions?.join(', ') || 'None documented'}
`
    : ''

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical scribe assistant. Convert the provided clinical encounter transcription into a structured SOAP note format.
Be professional, accurate, and use appropriate medical terminology.
${contextInfo}

Return ONLY a JSON object with the following structure:
{
  "chiefComplaint": "Brief statement of the main reason for the visit",
  "subjective": "Patient's reported symptoms, history of present illness, review of systems",
  "objective": "Physical examination findings, vital signs observations mentioned",
  "assessment": "Clinical impressions and diagnoses based on subjective and objective findings",
  "plan": "Treatment plan, medications prescribed, follow-up instructions, patient education"
}`,
        },
        {
          role: 'user',
          content: `Convert this clinical encounter transcription into a SOAP note:\n\n${transcription}`,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Failed to generate SOAP note')
    }

    const parsed = parseAIJson<{
      chiefComplaint: string
      subjective: string
      objective: string
      assessment: string
      plan: string
    }>(content)
    if (!parsed) throw new Error('Invalid response format')
    return parsed
  } catch (error) {
    console.error('OpenRouter API error, falling back to demo mode:', error)
    return generateMockSOAPNote(transcription)
  }
}

// Billing Coder - Suggest ICD-10 and CPT codes
export async function suggestBillingCodes(clinicalNote: string): Promise<{
  icdCodes: Array<{ code: string; description: string; confidence: number }>
  cptCodes: Array<{ code: string; description: string; confidence: number }>
}> {
  if (!openai) {
    console.log('OpenRouter API key not configured - using demo mode')
    return generateMockBillingCodes(clinicalNote)
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical coding assistant specializing in ICD-10 and CPT code assignment.
Analyze the clinical note and suggest appropriate diagnosis (ICD-10-CM) and procedure (CPT) codes.
Provide confidence scores (0-100) for each suggestion.

Return ONLY a JSON object with the following structure:
{
  "icdCodes": [
    {"code": "X00.0", "description": "Description", "confidence": 95}
  ],
  "cptCodes": [
    {"code": "99213", "description": "Description", "confidence": 90}
  ]
}

Order codes by confidence (highest first). Include only codes with >70% confidence.
For ICD-10, prioritize specificity and accuracy.
For CPT, consider E/M level based on complexity of encounter.`,
        },
        {
          role: 'user',
          content: `Analyze this clinical note and suggest billing codes:\n\n${clinicalNote}`,
        },
      ],
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Failed to suggest billing codes')
    }

    const parsed = parseAIJson<{
      icdCodes: Array<{ code: string; description: string; confidence: number }>
      cptCodes: Array<{ code: string; description: string; confidence: number }>
    }>(content)
    if (!parsed) throw new Error('Invalid response format')
    return parsed
  } catch (error) {
    console.error('OpenRouter API error, falling back to demo mode:', error)
    return generateMockBillingCodes(clinicalNote)
  }
}

// Denial Predictor - Predict claim denial risk
export async function predictDenialRisk(claimDetails: {
  diagnosis: string[]
  procedures: string[]
  insurance: string
  totalCharges: number
  placeOfService?: string
}): Promise<{
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: Array<{ factor: string; impact: string; recommendation: string }>
  overallRecommendation: string
}> {
  if (!openai) {
    console.log('OpenRouter API key not configured - using demo mode')
    return generateMockDenialRisk(claimDetails)
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a healthcare claims analysis assistant specializing in predicting denial risk.
Analyze the claim details and identify potential risk factors for denial.
Consider common denial reasons: medical necessity, coding errors, missing documentation,
authorization issues, timely filing, and bundling errors.

Return ONLY a JSON object with the following structure:
{
  "riskScore": 0-100,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFactors": [
    {
      "factor": "Brief description of risk factor",
      "impact": "LOW" | "MEDIUM" | "HIGH",
      "recommendation": "How to mitigate this risk"
    }
  ],
  "overallRecommendation": "Summary recommendation for the claim"
}

Risk levels: LOW (0-30), MEDIUM (31-60), HIGH (61-100)`,
        },
        {
          role: 'user',
          content: `Analyze denial risk for this claim:
Diagnoses: ${claimDetails.diagnosis.join(', ')}
Procedures: ${claimDetails.procedures.join(', ')}
Insurance: ${claimDetails.insurance}
Total Charges: $${claimDetails.totalCharges}
Place of Service: ${claimDetails.placeOfService || 'Office'}`,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Failed to predict denial risk')
    }

    const parsed = parseAIJson<{
      riskScore: number
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
      riskFactors: Array<{ factor: string; impact: string; recommendation: string }>
      overallRecommendation: string
    }>(content)
    if (!parsed) throw new Error('Invalid response format')
    return parsed
  } catch (error) {
    console.error('OpenRouter API error, falling back to demo mode:', error)
    return generateMockDenialRisk(claimDetails)
  }
}

// Transcribe audio (Deepgram REST integration; Whisper-compatible fallback)
export async function transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<string> {
  const deepgramKey = process.env.DEEPGRAM_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  // Prefer Deepgram if configured
  if (deepgramKey) {
    const resp = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${deepgramKey}`,
          'Content-Type': mimeType,
        },
        body: audioBuffer as unknown as BodyInit,
      }
    )
    if (!resp.ok) {
      const txt = await resp.text()
      throw new Error(`Deepgram error: ${resp.status} ${txt}`)
    }
    const data = await resp.json()
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    if (!transcript) throw new Error('Empty transcription from Deepgram')
    return transcript
  }

  // Fallback: OpenAI Whisper (multipart upload)
  if (openaiKey) {
    const form = new FormData()
    const blob = new Blob([audioBuffer as unknown as ArrayBuffer], { type: mimeType })
    form.append('file', blob, 'audio.wav')
    form.append('model', 'whisper-1')
    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form as unknown as BodyInit,
    })
    if (!resp.ok) {
      const txt = await resp.text()
      throw new Error(`Whisper error: ${resp.status} ${txt}`)
    }
    const data = await resp.json()
    if (!data?.text) throw new Error('Empty transcription from Whisper')
    return data.text as string
  }

  throw new Error(
    'Audio transcription requires DEEPGRAM_API_KEY (preferred) or OPENAI_API_KEY for Whisper fallback'
  )
}
