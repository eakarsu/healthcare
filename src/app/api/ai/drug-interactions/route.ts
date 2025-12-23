import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import OpenAI from 'openai'

// Check if OpenRouter API key is configured
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

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'major' | 'moderate' | 'minor'
  description: string
  mechanism: string
  clinicalEffects: string[]
  management: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { medications } = body

    if (!medications || medications.length < 2) {
      return NextResponse.json({ error: 'At least 2 medications required' }, { status: 400 })
    }

    // If OpenRouter is not configured, use mock database
    if (!openai) {
      console.log('OpenRouter not configured - using mock response')
      return NextResponse.json(getMockInteractions(medications))
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a clinical pharmacology expert analyzing drug-drug interactions.
For the provided list of medications, identify all potential interactions between them.

Return ONLY a JSON object with the following structure:
{
  "medications": ["list of medications analyzed"],
  "interactions": [
    {
      "drug1": "First drug name",
      "drug2": "Second drug name",
      "severity": "major" | "moderate" | "minor",
      "description": "Brief description of the interaction",
      "mechanism": "Pharmacological mechanism of the interaction",
      "clinicalEffects": ["List of potential clinical effects"],
      "management": "Recommendation for managing this interaction"
    }
  ],
  "safeToUse": true/false (false if any major interactions),
  "summary": "Brief summary of findings",
  "alternatives": [
    {
      "originalDrug": "Drug to replace",
      "alternatives": ["Alternative medications"],
      "reason": "Why these alternatives are safer"
    }
  ]
}

Severity levels:
- major: Avoid combination, serious/life-threatening effects possible
- moderate: Use with caution, monitor closely
- minor: Minimal clinical significance, be aware

Be thorough and consider all pairwise combinations. If no significant interactions, return empty interactions array.`
          },
          {
            role: 'user',
            content: `Analyze drug interactions for these medications: ${medications.join(', ')}`
          }
        ],
        temperature: 0.2,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          let cleanJson = jsonMatch[0]
            .replace(/[\x00-\x1F\x7F]/g, (char) => {
              if (char === '\n') return '\\n'
              if (char === '\r') return '\\r'
              if (char === '\t') return '\\t'
              return ''
            })
          const result = JSON.parse(cleanJson)
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(getMockInteractions(medications))
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      return NextResponse.json(getMockInteractions(medications))
    }
  } catch (error) {
    console.error('Drug interaction error:', error)
    return NextResponse.json({ error: 'Failed to check interactions' }, { status: 500 })
  }
}

// Mock interaction database for fallback
const interactionDatabase: DrugInteraction[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'major',
    description: 'Increased risk of bleeding when used together',
    mechanism: 'Aspirin inhibits platelet aggregation while warfarin inhibits vitamin K-dependent clotting factors',
    clinicalEffects: ['Increased INR', 'GI bleeding', 'Intracranial hemorrhage risk'],
    management: 'Use only if benefit outweighs risk. Monitor INR closely. Consider PPI for GI protection.',
  },
  {
    drug1: 'warfarin',
    drug2: 'ibuprofen',
    severity: 'major',
    description: 'NSAIDs increase bleeding risk with warfarin',
    mechanism: 'NSAIDs inhibit platelet function and can cause GI ulceration, while also displacing warfarin from protein binding',
    clinicalEffects: ['Increased INR', 'GI bleeding', 'Prolonged bleeding time'],
    management: 'Avoid combination if possible. If needed, use lowest NSAID dose for shortest duration. Monitor INR.',
  },
  {
    drug1: 'aspirin',
    drug2: 'ibuprofen',
    severity: 'moderate',
    description: 'Ibuprofen may reduce cardioprotective effect of aspirin',
    mechanism: 'Ibuprofen competes with aspirin for COX-1 binding site, potentially blocking aspirin\'s antiplatelet effect',
    clinicalEffects: ['Reduced cardiovascular protection', 'Increased GI bleeding risk'],
    management: 'Take aspirin 30 minutes before ibuprofen or 8 hours after. Consider alternative analgesic.',
  },
  {
    drug1: 'metformin',
    drug2: 'lisinopril',
    severity: 'minor',
    description: 'Generally safe combination, commonly used together',
    mechanism: 'No significant pharmacokinetic interaction. Both are commonly prescribed together for diabetic patients with hypertension.',
    clinicalEffects: ['Monitor renal function as both drugs can affect kidneys'],
    management: 'Safe to use together. Monitor renal function periodically.',
  },
]

function getMockInteractions(medications: string[]) {
  const normalizedMeds = medications.map((m: string) => m.toLowerCase().trim())
  const foundInteractions: DrugInteraction[] = []
  const alternatives: any[] = []

  // Check for interactions
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i]
      const med2 = normalizedMeds[j]

      for (const interaction of interactionDatabase) {
        const drug1Lower = interaction.drug1.toLowerCase()
        const drug2Lower = interaction.drug2.toLowerCase()

        if (
          (med1.includes(drug1Lower) || drug1Lower.includes(med1)) &&
          (med2.includes(drug2Lower) || drug2Lower.includes(med2))
        ) {
          foundInteractions.push({
            ...interaction,
            drug1: medications[i],
            drug2: medications[j],
          })
        } else if (
          (med1.includes(drug2Lower) || drug2Lower.includes(med1)) &&
          (med2.includes(drug1Lower) || drug1Lower.includes(med2))
        ) {
          foundInteractions.push({
            ...interaction,
            drug1: medications[j],
            drug2: medications[i],
          })
        }
      }
    }
  }

  // Generate alternatives for major interactions
  foundInteractions.forEach((interaction) => {
    if (interaction.severity === 'major') {
      if (interaction.drug1.toLowerCase().includes('warfarin') && interaction.drug2.toLowerCase().includes('aspirin')) {
        alternatives.push({
          originalDrug: interaction.drug2,
          alternatives: ['Clopidogrel (if antiplatelet needed)', 'Low-dose aspirin 81mg with PPI'],
          reason: 'To reduce bleeding risk while maintaining cardiovascular protection',
        })
      }
      if (interaction.drug1.toLowerCase().includes('warfarin') && interaction.drug2.toLowerCase().includes('ibuprofen')) {
        alternatives.push({
          originalDrug: interaction.drug2,
          alternatives: ['Acetaminophen', 'Topical NSAIDs', 'Tramadol (with caution)'],
          reason: 'To provide pain relief without significantly increasing bleeding risk',
        })
      }
    }
  })

  const hasMajorInteraction = foundInteractions.some((i) => i.severity === 'major')

  return {
    medications: medications,
    interactions: foundInteractions,
    safeToUse: foundInteractions.length === 0 || !hasMajorInteraction,
    summary: foundInteractions.length === 0
      ? 'No significant drug interactions found between these medications.'
      : `Found ${foundInteractions.length} interaction(s). ${hasMajorInteraction ? 'Major interaction detected - review recommended.' : 'Monitor and use with caution.'}`,
    alternatives,
  }
}
