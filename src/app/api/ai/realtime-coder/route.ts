import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
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

// Real-time coding suggestions from clinical text
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { encounterId, text, position, existingCodes } = await request.json()

    if (!text) {
      return apiError('Text is required', 400)
    }

    // Get suggestions from AI
    const suggestions = await generateRealtimeSuggestions(text, existingCodes || [])

    // If encounterId provided, save suggestions
    if (encounterId && suggestions.length > 0) {
      await prisma.codingSuggestion.createMany({
        data: suggestions.map(s => ({
          encounterId,
          triggerText: text,
          triggerPosition: position,
          codeType: s.type,
          code: s.code,
          description: s.description,
          confidence: s.confidence
        }))
      })
    }

    // Check for audit rules violations
    const auditAlerts = await checkCodingRules(suggestions, existingCodes || [])

    return apiResponse({
      suggestions,
      auditAlerts
    })
  } catch (error) {
    console.error('Failed to generate coding suggestions:', error)
    return apiError('Failed to generate suggestions', 500)
  }
}

// Accept or reject a suggestion
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { suggestionId, action, rejectionReason } = await request.json()

    if (!suggestionId || !action) {
      return apiError('Suggestion ID and action required', 400)
    }

    const suggestion = await prisma.codingSuggestion.findUnique({
      where: { id: suggestionId }
    })

    if (!suggestion) {
      return apiError('Suggestion not found', 404)
    }

    const updated = await prisma.codingSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
        acceptedAt: action === 'accept' ? new Date() : null,
        rejectedAt: action === 'reject' ? new Date() : null,
        rejectionReason: action === 'reject' ? rejectionReason : null
      }
    })

    return apiResponse(updated)
  } catch (error) {
    console.error('Failed to update suggestion:', error)
    return apiError('Failed to update suggestion', 500)
  }
}

// Generate real-time coding suggestions
async function generateRealtimeSuggestions(
  text: string,
  existingCodes: Array<{ type: string; code: string }>
): Promise<Array<{
  type: 'ICD10' | 'CPT'
  code: string
  description: string
  confidence: number
  rationale: string
}>> {
  // Keywords that trigger ICD-10 suggestions
  const icdKeywords: Record<string, { code: string; description: string }> = {
    'hypertension': { code: 'I10', description: 'Essential (primary) hypertension' },
    'high blood pressure': { code: 'I10', description: 'Essential (primary) hypertension' },
    'diabetes': { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    'type 2 diabetes': { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    'type 1 diabetes': { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications' },
    'headache': { code: 'R51.9', description: 'Headache, unspecified' },
    'migraine': { code: 'G43.909', description: 'Migraine, unspecified, not intractable' },
    'back pain': { code: 'M54.5', description: 'Low back pain' },
    'lower back pain': { code: 'M54.5', description: 'Low back pain' },
    'anxiety': { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
    'depression': { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
    'chest pain': { code: 'R07.9', description: 'Chest pain, unspecified' },
    'shortness of breath': { code: 'R06.02', description: 'Shortness of breath' },
    'dyspnea': { code: 'R06.02', description: 'Shortness of breath' },
    'cough': { code: 'R05.9', description: 'Cough, unspecified' },
    'fever': { code: 'R50.9', description: 'Fever, unspecified' },
    'fatigue': { code: 'R53.83', description: 'Other fatigue' },
    'nausea': { code: 'R11.0', description: 'Nausea' },
    'vomiting': { code: 'R11.10', description: 'Vomiting, unspecified' },
    'diarrhea': { code: 'R19.7', description: 'Diarrhea, unspecified' },
    'abdominal pain': { code: 'R10.9', description: 'Unspecified abdominal pain' },
    'joint pain': { code: 'M25.50', description: 'Pain in unspecified joint' },
    'knee pain': { code: 'M25.561', description: 'Pain in right knee' },
    'hip pain': { code: 'M25.551', description: 'Pain in right hip' },
    'shoulder pain': { code: 'M25.511', description: 'Pain in right shoulder' },
    'obesity': { code: 'E66.9', description: 'Obesity, unspecified' },
    'overweight': { code: 'E66.3', description: 'Overweight' },
    'insomnia': { code: 'G47.00', description: 'Insomnia, unspecified' },
    'sleep apnea': { code: 'G47.30', description: 'Sleep apnea, unspecified' },
    'copd': { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' },
    'asthma': { code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
    'uti': { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
    'urinary tract infection': { code: 'N39.0', description: 'Urinary tract infection, site not specified' }
  }

  const suggestions: Array<{
    type: 'ICD10' | 'CPT'
    code: string
    description: string
    confidence: number
    rationale: string
  }> = []

  const lowerText = text.toLowerCase()

  // Check for keyword matches
  for (const [keyword, codeInfo] of Object.entries(icdKeywords)) {
    if (lowerText.includes(keyword)) {
      // Don't suggest if already exists
      const alreadyExists = existingCodes.some(
        c => c.code === codeInfo.code && c.type === 'ICD10'
      )

      if (!alreadyExists) {
        suggestions.push({
          type: 'ICD10',
          code: codeInfo.code,
          description: codeInfo.description,
          confidence: 0.85,
          rationale: `Detected "${keyword}" in clinical text`
        })
      }
    }
  }

  // E/M level suggestion based on complexity
  if (!existingCodes.some(c => c.type === 'CPT' && c.code.startsWith('992'))) {
    const wordCount = text.split(/\s+/).length
    const hasMultipleProblems = suggestions.length > 2

    let emCode: { code: string; description: string; confidence: number }

    if (wordCount > 500 || hasMultipleProblems) {
      emCode = {
        code: '99215',
        description: 'Office visit, established patient, high complexity',
        confidence: 0.8
      }
    } else if (wordCount > 200) {
      emCode = {
        code: '99214',
        description: 'Office visit, established patient, moderate complexity',
        confidence: 0.85
      }
    } else {
      emCode = {
        code: '99213',
        description: 'Office visit, established patient, low complexity',
        confidence: 0.9
      }
    }

    suggestions.push({
      type: 'CPT',
      ...emCode,
      rationale: `Based on documentation complexity (${wordCount} words, ${suggestions.length} diagnoses)`
    })
  }

  // Use AI for more sophisticated suggestions if available
  if (openai && suggestions.length === 0) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a medical coding assistant. Analyze the clinical text and suggest appropriate ICD-10 and CPT codes.
Return ONLY a JSON array of suggestions:
[
  {
    "type": "ICD10" | "CPT",
    "code": "X00.0",
    "description": "Code description",
    "confidence": 0.0-1.0,
    "rationale": "Why this code is suggested"
  }
]
Only suggest codes with >70% confidence. Be specific with ICD-10 codes.`
          },
          {
            role: 'user',
            content: `Suggest codes for:\n${text}\n\nExisting codes: ${existingCodes.map(c => c.code).join(', ') || 'None'}`
          }
        ],
        temperature: 0.2
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const aiSuggestions = JSON.parse(jsonMatch[0])
          return aiSuggestions.filter((s: { code: string; type: string }) =>
            !existingCodes.some(e => e.code === s.code && e.type === s.type)
          )
        }
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
    }
  }

  return suggestions.slice(0, 10) // Limit to 10 suggestions
}

// Check coding rules for compliance issues
async function checkCodingRules(
  suggestions: Array<{ type: string; code: string; description: string }>,
  existingCodes: Array<{ type: string; code: string }>
): Promise<Array<{
  type: 'WARNING' | 'ERROR'
  rule: string
  message: string
  affectedCodes: string[]
}>> {
  const alerts: Array<{
    type: 'WARNING' | 'ERROR'
    rule: string
    message: string
    affectedCodes: string[]
  }> = []

  // Get audit rules from database
  const rules = await prisma.codingAuditRule.findMany({
    where: { isActive: true }
  })

  const allCodes = [...existingCodes, ...suggestions.map(s => ({ type: s.type, code: s.code }))]
  const cptCodes = allCodes.filter(c => c.type === 'CPT').map(c => c.code)
  const icdCodes = allCodes.filter(c => c.type === 'ICD10').map(c => c.code)

  // Built-in bundling rules
  const bundlingRules: Array<{ codes: string[]; message: string }> = [
    {
      codes: ['99213', '99214', '99215'],
      message: 'Multiple E/M codes - only bill the highest level'
    },
    {
      codes: ['93000', '93005', '93010'],
      message: 'EKG codes may be bundled - verify appropriate billing'
    }
  ]

  for (const rule of bundlingRules) {
    const matches = cptCodes.filter(c => rule.codes.includes(c))
    if (matches.length > 1) {
      alerts.push({
        type: 'WARNING',
        rule: 'BUNDLING',
        message: rule.message,
        affectedCodes: matches
      })
    }
  }

  // Medical necessity check - diagnoses should support procedures
  if (cptCodes.length > 0 && icdCodes.length === 0) {
    alerts.push({
      type: 'ERROR',
      rule: 'MEDICAL_NECESSITY',
      message: 'No diagnosis codes - procedures require supporting diagnosis',
      affectedCodes: cptCodes
    })
  }

  // Apply database rules
  for (const rule of rules) {
    const applicableCpts = cptCodes.filter(c => rule.cptCodes.includes(c))
    const applicableIcds = icdCodes.filter(c => rule.icdCodes.includes(c))

    if (applicableCpts.length > 0 || applicableIcds.length > 0) {
      alerts.push({
        type: rule.action === 'BLOCK' ? 'ERROR' : 'WARNING',
        rule: rule.ruleType,
        message: rule.message,
        affectedCodes: [...applicableCpts, ...applicableIcds]
      })
    }
  }

  return alerts
}
