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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { diagnosis, patientAge, patientGender, comorbidities, currentMedications, allergies, additionalNotes } = body

    if (!diagnosis) {
      return NextResponse.json({ error: 'Diagnosis is required' }, { status: 400 })
    }

    // If OpenRouter is not configured, return mock data
    if (!openai) {
      console.log('OpenRouter not configured - using mock response')
      return NextResponse.json(getMockRecommendations(diagnosis, allergies))
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a clinical decision support assistant providing evidence-based treatment recommendations.
Based on the diagnosis and patient information provided, generate comprehensive treatment recommendations.

Return ONLY a JSON object with the following structure:
{
  "diagnosis": "Primary diagnosis",
  "icdCode": "ICD-10 code",
  "guidelines": [
    {
      "category": "Category name (e.g., Lifestyle Modifications, Pharmacological Therapy)",
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description",
          "evidenceLevel": "A" | "B" | "C",
          "source": "Clinical guideline source"
        }
      ]
    }
  ],
  "medications": [
    {
      "name": "Medication name",
      "dosage": "Recommended dosage",
      "frequency": "Dosing frequency",
      "duration": "Duration of treatment",
      "contraindications": ["List of contraindications"]
    }
  ],
  "procedures": ["List of recommended procedures if applicable"],
  "referrals": ["List of specialist referrals if needed"],
  "followUp": "Follow-up recommendations",
  "warnings": ["Important warnings or alerts based on patient info"]
}

Use current clinical guidelines (ADA, ACC/AHA, etc.) as sources.
Consider patient allergies and current medications for contraindications.
Evidence levels: A = Strong evidence, B = Moderate evidence, C = Limited evidence`
          },
          {
            role: 'user',
            content: `Generate treatment recommendations for:

Diagnosis: ${diagnosis}
Patient Age: ${patientAge || 'Not specified'}
Patient Gender: ${patientGender || 'Not specified'}
Comorbidities: ${comorbidities || 'None reported'}
Current Medications: ${currentMedications || 'None reported'}
Allergies: ${allergies || 'NKDA'}
Additional Notes: ${additionalNotes || 'None'}

Provide evidence-based treatment recommendations considering all patient factors.`
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
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(getMockRecommendations(diagnosis, allergies))
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      return NextResponse.json(getMockRecommendations(diagnosis, allergies))
    }
  } catch (error) {
    console.error('Treatment recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

function getMockRecommendations(diagnosis: string, allergies?: string) {
  const diagnosisLower = diagnosis.toLowerCase()

  let result: any = {
    diagnosis: diagnosis,
    icdCode: 'I10',
    guidelines: [],
    medications: [],
    procedures: [],
    referrals: [],
    followUp: 'Follow up in 4-6 weeks to assess treatment response.',
    warnings: [],
  }

  if (allergies) {
    result.warnings.push(`Patient has documented allergies: ${allergies}. Review all medication recommendations.`)
  }

  // Type 2 Diabetes recommendations
  if (diagnosisLower.includes('diabetes') || diagnosisLower.includes('dm2')) {
    result.icdCode = 'E11.9'
    result.guidelines = [
      {
        category: 'Lifestyle Modifications',
        recommendations: [
          {
            title: 'Medical Nutrition Therapy',
            description: 'Refer to registered dietitian for individualized meal planning. Target carbohydrate intake of 45-60g per meal.',
            evidenceLevel: 'A',
            source: 'ADA Standards of Medical Care 2024',
          },
          {
            title: 'Physical Activity',
            description: '150 minutes/week of moderate-intensity aerobic activity. Include resistance training 2-3 times per week.',
            evidenceLevel: 'A',
            source: 'ADA Standards of Medical Care 2024',
          },
        ],
      },
      {
        category: 'Pharmacological Therapy',
        recommendations: [
          {
            title: 'First-line: Metformin',
            description: 'Start metformin unless contraindicated. Begin with 500mg daily with meals, titrate to 1000mg BID.',
            evidenceLevel: 'A',
            source: 'ADA/EASD Consensus Report 2022',
          },
          {
            title: 'Consider GLP-1 RA or SGLT2i',
            description: 'For patients with cardiovascular disease or high risk, add GLP-1 receptor agonist or SGLT2 inhibitor.',
            evidenceLevel: 'A',
            source: 'ADA Standards of Medical Care 2024',
          },
        ],
      },
    ]
    result.medications = [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        duration: 'Ongoing',
        contraindications: ['eGFR < 30', 'Metabolic acidosis', 'Contrast dye procedures'],
      },
      {
        name: 'Semaglutide (Ozempic)',
        dosage: '0.25mg',
        frequency: 'Once weekly (titrate to 1mg)',
        duration: 'Ongoing',
        contraindications: ['Personal/family history of MTC', 'MEN2 syndrome'],
      },
    ]
    result.referrals = ['Endocrinology (if A1C > 9%)', 'Ophthalmology (annual diabetic eye exam)', 'Podiatry']
    result.followUp = 'Recheck A1C in 3 months. If not at goal, consider therapy intensification.'
  }
  // Hypertension recommendations
  else if (diagnosisLower.includes('hypertension') || diagnosisLower.includes('htn') || diagnosisLower.includes('blood pressure')) {
    result.icdCode = 'I10'
    result.guidelines = [
      {
        category: 'Lifestyle Modifications',
        recommendations: [
          {
            title: 'DASH Diet',
            description: 'Adopt DASH eating plan rich in fruits, vegetables, low-fat dairy. Reduce sodium to <2300mg/day.',
            evidenceLevel: 'A',
            source: 'ACC/AHA Hypertension Guidelines 2017',
          },
          {
            title: 'Weight Management',
            description: 'Target BMI 18.5-24.9. Each 1kg weight loss may reduce BP by ~1 mmHg.',
            evidenceLevel: 'A',
            source: 'ACC/AHA Hypertension Guidelines 2017',
          },
        ],
      },
      {
        category: 'Pharmacological Therapy',
        recommendations: [
          {
            title: 'First-line Agents',
            description: 'ACE inhibitor, ARB, CCB, or thiazide diuretic. Choice based on comorbidities.',
            evidenceLevel: 'A',
            source: 'ACC/AHA Hypertension Guidelines 2017',
          },
        ],
      },
    ]
    result.medications = [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: 'Ongoing',
        contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Angioedema history'],
      },
      {
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: 'Ongoing',
        contraindications: ['Severe aortic stenosis'],
      },
    ]
    result.referrals = ['Cardiology (if resistant hypertension)', 'Nephrology (if CKD)']
    result.followUp = 'Recheck BP in 4 weeks. Target < 130/80 for most patients.'
  }
  // Default generic response
  else {
    result.guidelines = [
      {
        category: 'General Recommendations',
        recommendations: [
          {
            title: 'Clinical Assessment',
            description: 'Complete history and physical examination. Order appropriate diagnostic tests.',
            evidenceLevel: 'C',
            source: 'Clinical Practice Standards',
          },
          {
            title: 'Patient Education',
            description: 'Provide education about the condition, treatment options, and self-management strategies.',
            evidenceLevel: 'B',
            source: 'Patient-Centered Care Guidelines',
          },
        ],
      },
    ]
    result.followUp = 'Schedule follow-up based on clinical assessment and treatment response.'
  }

  return result
}
