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
    const {
      patientName,
      patientDOB,
      patientMRN,
      referringProvider,
      referringPractice,
      referringPhone,
      referringFax,
      referToSpecialty,
      referToProvider,
      referToPractice,
      urgency,
      diagnosis,
      reasonForReferral,
      relevantHistory,
      currentMedications,
      allergies,
      relevantTests,
      specificQuestions,
    } = body

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // If OpenRouter is not configured, return template-based letter
    if (!openai) {
      console.log('OpenRouter not configured - using template response')
      return NextResponse.json({ letter: generateTemplateLetter(body, today, session) })
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a medical professional writing a formal referral letter. Generate a professional, well-structured referral letter based on the provided patient information.

The letter should:
- Be formal and professional in tone
- Include all relevant clinical information
- Be structured with clear sections
- Include appropriate medical terminology
- Be comprehensive but concise
- Follow standard medical referral letter format

Return ONLY the letter text, no JSON or additional formatting.`
          },
          {
            role: 'user',
            content: `Generate a professional referral letter with the following information:

Date: ${today}
Urgency: ${urgency || 'Routine'}

PATIENT INFORMATION:
- Name: ${patientName}
- DOB: ${patientDOB || 'On file'}
- MRN: ${patientMRN || 'On file'}

REFERRING PROVIDER:
- Provider: ${referringProvider || 'Referring Physician'}
- Practice: ${referringPractice || 'Medical Practice'}
- Phone: ${referringPhone || '(555) 123-4567'}
- Fax: ${referringFax || '(555) 123-4568'}

REFERRAL TO:
- Specialty: ${referToSpecialty || 'Specialist'}
- Provider: ${referToProvider || 'Specialist Physician'}
- Practice: ${referToPractice || 'Specialty Practice'}

CLINICAL INFORMATION:
- Diagnosis: ${diagnosis || 'See below'}
- Reason for Referral: ${reasonForReferral || 'Evaluation and management'}
- Relevant Medical History: ${relevantHistory || 'See patient records'}
- Current Medications: ${currentMedications || 'See patient records'}
- Allergies: ${allergies || 'NKDA'}
- Relevant Tests/Imaging: ${relevantTests || 'Attached'}
- Specific Questions for Specialist: ${specificQuestions || 'Please evaluate and provide recommendations'}

Generate a complete, professional referral letter.`
          }
        ],
        temperature: 0.7,
      })

      const letter = response.choices[0]?.message?.content
      if (!letter) {
        throw new Error('No response from AI')
      }

      return NextResponse.json({ letter: letter.trim() })
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      // Fall back to template on AI error
      return NextResponse.json({ letter: generateTemplateLetter(body, today, session) })
    }
  } catch (error) {
    console.error('Referral letter error:', error)
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 })
  }
}

function generateTemplateLetter(body: any, today: string, session: any): string {
  const {
    patientName,
    patientDOB,
    patientMRN,
    referringProvider,
    referringPractice,
    referringPhone,
    referringFax,
    referToSpecialty,
    referToProvider,
    referToPractice,
    urgency,
    diagnosis,
    reasonForReferral,
    relevantHistory,
    currentMedications,
    allergies,
    relevantTests,
    specificQuestions,
  } = body

  const urgencyText = urgency === 'emergent'
    ? '*** URGENT - SAME DAY EVALUATION REQUESTED ***\n\n'
    : urgency === 'urgent'
    ? '** URGENT - EVALUATION WITHIN 1 WEEK REQUESTED **\n\n'
    : ''

  return `${urgencyText}${today}

${referToProvider || `${referToSpecialty?.charAt(0).toUpperCase()}${referToSpecialty?.slice(1)} Department`}
${referToPractice || ''}

RE: Referral for ${patientName}
    DOB: ${patientDOB || 'On file'}
    MRN: ${patientMRN || 'See attached'}

Dear ${referToProvider || 'Colleague'},

I am referring my patient, ${patientName}, to your practice for ${referToSpecialty} evaluation and management.

REASON FOR REFERRAL:
${reasonForReferral || 'Please see patient for evaluation and treatment recommendations.'}

${diagnosis ? `DIAGNOSIS:\n${diagnosis}\n` : ''}
${relevantHistory ? `RELEVANT MEDICAL HISTORY:\n${relevantHistory}\n` : ''}
${currentMedications ? `CURRENT MEDICATIONS:\n${currentMedications}\n` : ''}
${allergies ? `ALLERGIES:\n${allergies}\n` : ''}
${relevantTests ? `RELEVANT TESTS/IMAGING:\n${relevantTests}\n` : ''}
${specificQuestions ? `SPECIFIC QUESTIONS:\n${specificQuestions}\n` : ''}

I would appreciate your evaluation and recommendations regarding ${patientName}'s care. Please do not hesitate to contact our office if you require any additional information or if you have questions regarding this referral.

Thank you for your assistance in the care of this patient. I look forward to receiving your consultation report.

Sincerely,


_____________________________
${referringProvider || session?.user?.firstName ? `${session.user.firstName} ${session.user.lastName}` : 'Referring Provider'}
${referringPractice || 'Medical Practice'}

Contact Information:
Phone: ${referringPhone || '(555) 123-4567'}
Fax: ${referringFax || '(555) 123-4568'}

Enclosures:
☐ Relevant clinical notes
☐ Recent lab results
☐ Imaging reports
☐ Insurance authorization (if applicable)`.trim()
}
