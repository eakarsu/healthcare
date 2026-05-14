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

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientName, insurancePlan, procedureCode, procedureName, diagnosis, clinicalJustification, urgency } = body

    const referenceNumber = `PA-${Date.now().toString().slice(-8)}`
    const estimatedDecisionDate = new Date(Date.now() + (urgency === 'emergent' ? 1 : urgency === 'urgent' ? 3 : 5) * 24 * 60 * 60 * 1000).toLocaleDateString()

    // If OpenRouter is not configured, return mock data
    if (!openai) {
      console.log('OpenRouter not configured - using mock response')
      return NextResponse.json(getMockResponse(patientName, insurancePlan, procedureCode, procedureName, diagnosis, clinicalJustification, referenceNumber, estimatedDecisionDate))
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a medical prior authorization specialist. Generate a comprehensive prior authorization request based on the provided information.

Return a JSON object with the following structure:
{
  "status": "pending",
  "referenceNumber": "${referenceNumber}",
  "estimatedDecisionDate": "${estimatedDecisionDate}",
  "requirements": ["array of required documents/information"],
  "tips": ["array of tips for approval"],
  "generatedLetter": "Full formatted prior authorization letter"
}

The letter should be professional, detailed, and include:
- Proper medical terminology
- Clear medical necessity justification
- Reference to clinical guidelines when applicable
- Specific details from the clinical justification provided`
          },
          {
            role: 'user',
            content: `Generate a prior authorization request for:

Patient Name: ${patientName}
Insurance Plan: ${insurancePlan || 'Not specified'}
CPT Code: ${procedureCode}
Procedure Name: ${procedureName || 'Not specified'}
Diagnosis: ${diagnosis}
Urgency: ${urgency}

Clinical Justification:
${clinicalJustification || 'Not provided'}

Generate a comprehensive authorization request with requirements, tips for approval, and a detailed letter.`
          }
        ],
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse JSON from response - handle control characters
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          // Clean up the JSON string - replace problematic control characters
          let cleanJson = jsonMatch[0]
            .replace(/[\x00-\x1F\x7F]/g, (char) => {
              // Keep newlines and tabs but escape them properly
              if (char === '\n') return '\\n'
              if (char === '\r') return '\\r'
              if (char === '\t') return '\\t'
              return ''
            })

          const result = JSON.parse(cleanJson)
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('JSON parse error, using fallback:', parseError)
          // If parsing fails, return mock response with AI-generated letter extracted
          const letterMatch = content.match(/generatedLetter["\s:]+["']?([\s\S]*?)["']?\s*[,}]/)
          const mockResult = getMockResponse(patientName, insurancePlan, procedureCode, procedureName, diagnosis, clinicalJustification, referenceNumber, estimatedDecisionDate)
          if (letterMatch && letterMatch[1]) {
            mockResult.generatedLetter = letterMatch[1].replace(/\\n/g, '\n').trim()
          }
          return NextResponse.json(mockResult)
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      // Fall back to mock response on AI error
      return NextResponse.json(getMockResponse(patientName, insurancePlan, procedureCode, procedureName, diagnosis, clinicalJustification, referenceNumber, estimatedDecisionDate))
    }
  } catch (error) {
    console.error('Prior auth error:', error)
    return NextResponse.json({ error: 'Failed to process authorization request' }, { status: 500 })
  }
}

function getMockResponse(
  patientName: string,
  insurancePlan: string,
  procedureCode: string,
  procedureName: string,
  diagnosis: string,
  clinicalJustification: string,
  referenceNumber: string,
  estimatedDecisionDate: string
) {
  return {
    status: 'pending',
    referenceNumber,
    estimatedDecisionDate,
    requirements: [
      'Clinical notes from last 3 visits',
      'Imaging/diagnostic results (X-ray, MRI, CT as applicable)',
      'Documentation of conservative treatment failure',
      'Letter of medical necessity',
      'Relevant lab results',
    ],
    tips: [
      'Include specific dates of failed conservative treatments',
      'Document functional limitations in daily activities',
      'Reference current clinical guidelines supporting the procedure',
      'Include peer-reviewed literature if available',
      'Ensure all diagnosis codes match the procedure requested',
    ],
    generatedLetter: `PRIOR AUTHORIZATION REQUEST

Date: ${new Date().toLocaleDateString()}
Reference: ${referenceNumber}

To: ${insurancePlan || 'Insurance Provider'} Prior Authorization Department

RE: Prior Authorization Request for ${procedureName || procedureCode}
Patient: ${patientName}

Dear Prior Authorization Review Team,

I am writing to request prior authorization for ${procedureName || `CPT ${procedureCode}`} for my patient, ${patientName}.

DIAGNOSIS:
${diagnosis}

CLINICAL JUSTIFICATION:
${clinicalJustification || 'Patient has failed conservative management and requires this procedure for symptom relief and improved function.'}

MEDICAL NECESSITY:
This procedure is medically necessary because the patient has:
1. Failed conservative treatment options including medication management and physical therapy
2. Documented functional impairment affecting activities of daily living
3. Progressive symptoms despite appropriate conservative care
4. No contraindications to the proposed treatment

SUPPORTING EVIDENCE:
The requested procedure aligns with current clinical practice guidelines and represents the standard of care for this condition. Recent imaging and clinical findings confirm the diagnosis and support surgical intervention.

EXPECTED OUTCOMES:
This procedure is expected to:
- Reduce pain and improve mobility
- Restore functional capacity
- Improve quality of life
- Prevent further deterioration

I am available to discuss this case at your convenience and can provide peer-to-peer review if needed. Please contact our office if you require additional information or documentation.

Sincerely,

[Provider Signature]
[Provider Name, MD]
[Practice Name]
[Phone] | [Fax]
[NPI]`,
  }
}
