import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { patientId } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Fetch patient with all relevant data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        conditions: true,
        medications: true,
        allergies: true,
        encounters: {
          orderBy: { encounterDate: 'desc' },
          take: 5,
          select: { encounterDate: true, chiefComplaint: true },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Calculate age
    const age = patient.dateOfBirth
      ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0

    // Get condition names and medication names
    const conditions = patient.conditions.map(c => c.name)
    const medications = patient.medications.map(m => `${m.name} ${m.dosage || ''}`.trim())
    const allergies = patient.allergies.map(a => a.allergen)

    // Get last visit date
    const lastVisit = patient.encounters[0]?.encounterDate
      ? new Date(patient.encounters[0].encounterDate).toLocaleDateString()
      : 'No visits recorded'

    // If OpenRouter is not configured, use mock/algorithmic calculation
    if (!openai) {
      console.log('OpenRouter not configured - using algorithmic calculation')
      return NextResponse.json(getMockRiskAnalysis(patient.firstName, patient.lastName, age, conditions, medications, lastVisit))
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a healthcare risk stratification AI assistant. Analyze patient data to determine their overall health risk level and provide actionable recommendations.

Consider these factors when assessing risk:
- Age (higher risk for 65+)
- Chronic conditions (diabetes, hypertension, heart disease, COPD, etc.)
- Number of medications (polypharmacy risk)
- Medication interactions
- Recent healthcare utilization
- Social determinants of health
- Vital signs if available

Return ONLY a JSON object with this structure:
{
  "riskScore": number (0-100),
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "riskFactors": [
    {"factor": "Description of risk factor", "impact": number (estimated percentage impact)}
  ],
  "recommendedActions": ["Actionable recommendation 1", "Recommendation 2", ...]
}

Risk levels: low (0-39%), moderate (40-59%), high (60-79%), critical (80%+)
Be specific about conditions and provide evidence-based recommendations.`
          },
          {
            role: 'user',
            content: `Analyze health risk for this patient:

Demographics:
- Name: ${patient.firstName} ${patient.lastName}
- Age: ${age} years old
- Gender: ${patient.gender || 'Not specified'}

Active Conditions:
${conditions.length > 0 ? conditions.map(c => `- ${c}`).join('\n') : '- None documented'}

Current Medications (${medications.length}):
${medications.length > 0 ? medications.map(m => `- ${m}`).join('\n') : '- None documented'}

Allergies:
${allergies.length > 0 ? allergies.map(a => `- ${a}`).join('\n') : '- NKDA'}

Recent Visits:
${patient.encounters.length > 0
  ? patient.encounters.map(e => `- ${new Date(e.encounterDate).toLocaleDateString()}: ${e.chiefComplaint || 'General visit'}`).join('\n')
  : '- No recent visits'}

Last Visit: ${lastVisit}

Provide comprehensive risk assessment with specific, actionable recommendations.`
          }
        ],
        temperature: 0.3,
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
          return NextResponse.json({
            patientName: `${patient.firstName} ${patient.lastName}`,
            age,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            riskFactors: result.riskFactors,
            conditions,
            medications,
            recommendedActions: result.recommendedActions,
            lastVisit,
          })
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(getMockRiskAnalysis(patient.firstName, patient.lastName, age, conditions, medications, lastVisit))
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      return NextResponse.json(getMockRiskAnalysis(patient.firstName, patient.lastName, age, conditions, medications, lastVisit))
    }
  } catch (error) {
    console.error('Patient risk stratification error:', error)
    return NextResponse.json({ error: 'Failed to analyze risk' }, { status: 500 })
  }
}

// Fallback mock risk analysis when OpenRouter is not available
function getMockRiskAnalysis(
  firstName: string,
  lastName: string,
  age: number,
  conditions: string[],
  medications: string[],
  lastVisit: string
) {
  let riskScore = 20
  const riskFactors: Array<{ factor: string; impact: number }> = []
  const recommendedActions: string[] = []

  // Age factor
  if (age >= 65) {
    riskScore += 20
    riskFactors.push({ factor: 'Age 65 or older', impact: 20 })
    recommendedActions.push('Schedule annual wellness visit')
    recommendedActions.push('Review fall risk assessment')
  } else if (age >= 50) {
    riskScore += 10
    riskFactors.push({ factor: 'Age 50-64', impact: 10 })
  }

  // Conditions factor
  const conditionLower = conditions.map(c => c.toLowerCase())
  if (conditionLower.some(c => c.includes('diabetes'))) {
    riskScore += 15
    riskFactors.push({ factor: 'Diabetes', impact: 15 })
    recommendedActions.push('Ensure A1C test within last 3 months')
    recommendedActions.push('Schedule diabetic eye exam')
  }
  if (conditionLower.some(c => c.includes('hypertension') || c.includes('blood pressure'))) {
    riskScore += 10
    riskFactors.push({ factor: 'Hypertension', impact: 10 })
    recommendedActions.push('Verify home blood pressure monitoring')
  }
  if (conditionLower.some(c => c.includes('heart') || c.includes('cardiac') || c.includes('coronary'))) {
    riskScore += 20
    riskFactors.push({ factor: 'Cardiac condition', impact: 20 })
    recommendedActions.push('Schedule cardiology follow-up')
  }
  if (conditionLower.some(c => c.includes('copd') || c.includes('asthma') || c.includes('pulmonary'))) {
    riskScore += 10
    riskFactors.push({ factor: 'Respiratory condition', impact: 10 })
    recommendedActions.push('Review inhaler technique and adherence')
  }

  // Polypharmacy
  if (medications.length >= 5) {
    riskScore += 10
    riskFactors.push({ factor: `Polypharmacy (${medications.length} medications)`, impact: 10 })
    recommendedActions.push('Review medication list for potential interactions')
    recommendedActions.push('Consider medication reconciliation')
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100)

  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  if (riskScore >= 80) {
    riskLevel = 'critical'
    recommendedActions.unshift('Urgent care coordination recommended')
  } else if (riskScore >= 60) {
    riskLevel = 'high'
    recommendedActions.unshift('Schedule care management review')
  } else if (riskScore >= 40) {
    riskLevel = 'moderate'
  } else {
    riskLevel = 'low'
    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue routine preventive care')
    }
  }

  return {
    patientName: `${firstName} ${lastName}`,
    age,
    riskScore,
    riskLevel,
    riskFactors,
    conditions,
    medications,
    recommendedActions,
    lastVisit,
  }
}
