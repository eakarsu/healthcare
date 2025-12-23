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

    const { patientId, appointmentDate, appointmentTime, appointmentType } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Fetch patient with appointment history
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          orderBy: { scheduledStart: 'desc' },
          take: 20,
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Calculate historical stats
    const pastAppointments = patient.appointments || []
    const noShows = pastAppointments.filter(apt => apt.status === 'NO_SHOW').length
    const cancelled = pastAppointments.filter(apt => apt.status === 'CANCELLED').length
    const completed = pastAppointments.filter(apt => apt.status === 'COMPLETED').length
    const totalPast = pastAppointments.length

    // If OpenRouter is not configured, use mock/algorithmic calculation
    if (!openai) {
      console.log('OpenRouter not configured - using algorithmic calculation')
      return NextResponse.json(getMockPrediction(patient, {
        appointmentDate,
        appointmentTime,
        appointmentType,
        noShows,
        cancelled,
        totalPast,
      }))
    }

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a healthcare analytics AI specializing in patient no-show prediction.
Analyze the patient data and appointment details to predict the likelihood of a no-show.

Consider these factors:
- Historical no-show and cancellation patterns
- Appointment timing (time of day, day of week)
- Appointment type (new patient visits have higher no-show rates)
- How far in advance the appointment is scheduled
- Patient contact information availability
- Industry benchmarks (average no-show rate is 15-20%)

Return ONLY a JSON object with this structure:
{
  "noShowProbability": number (0-100),
  "riskLevel": "low" | "medium" | "high",
  "riskFactors": [
    {"factor": "Description of risk factor", "impact": number (estimated percentage impact)}
  ],
  "recommendations": ["Actionable recommendation 1", "Recommendation 2", ...]
}

Risk levels: low (0-29%), medium (30-49%), high (50%+)
Be specific and actionable in recommendations.`
          },
          {
            role: 'user',
            content: `Predict no-show probability for this patient:

Patient: ${patient.firstName} ${patient.lastName}
Age: ${patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'}
Phone: ${patient.phone || 'Not on file'}
Email: ${patient.email || 'Not on file'}

Appointment History (last 20):
- Total appointments: ${totalPast}
- Completed: ${completed}
- No-shows: ${noShows} (${totalPast > 0 ? ((noShows/totalPast)*100).toFixed(1) : 0}%)
- Cancelled: ${cancelled} (${totalPast > 0 ? ((cancelled/totalPast)*100).toFixed(1) : 0}%)

Proposed Appointment:
- Date: ${appointmentDate || 'Not specified'}
- Time: ${appointmentTime || 'Not specified'}
- Type: ${appointmentType || 'Not specified'}
${appointmentDate ? `- Day of week: ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })}` : ''}
${appointmentDate ? `- Days until appointment: ${Math.floor((new Date(appointmentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}` : ''}`
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
            noShowProbability: result.noShowProbability,
            riskLevel: result.riskLevel,
            riskFactors: result.riskFactors,
            historicalNoShows: noShows,
            totalAppointments: totalPast,
            recommendations: result.recommendations,
          })
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(getMockPrediction(patient, {
            appointmentDate,
            appointmentTime,
            appointmentType,
            noShows,
            cancelled,
            totalPast,
          }))
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (aiError) {
      console.error('OpenRouter API error:', aiError)
      return NextResponse.json(getMockPrediction(patient, {
        appointmentDate,
        appointmentTime,
        appointmentType,
        noShows,
        cancelled,
        totalPast,
      }))
    }
  } catch (error) {
    console.error('Patient no-show prediction error:', error)
    return NextResponse.json({ error: 'Failed to calculate risk' }, { status: 500 })
  }
}

// Fallback mock prediction when OpenRouter is not available
function getMockPrediction(
  patient: { firstName: string; lastName: string; phone: string | null; email: string | null },
  data: {
    appointmentDate?: string
    appointmentTime?: string
    appointmentType?: string
    noShows: number
    cancelled: number
    totalPast: number
  }
) {
  let probability = 15
  const riskFactors: Array<{ factor: string; impact: number }> = []
  const recommendations: string[] = []

  // Historical no-show rate
  if (data.totalPast > 0) {
    const noShowRate = (data.noShows / data.totalPast) * 100
    if (noShowRate > 30) {
      const impact = Math.min(25, Math.round(noShowRate * 0.5))
      probability += impact
      riskFactors.push({ factor: `High historical no-show rate (${noShowRate.toFixed(0)}%)`, impact })
      recommendations.push('Consider requiring appointment deposit or prepayment')
    } else if (noShowRate > 15) {
      const impact = Math.min(15, Math.round(noShowRate * 0.4))
      probability += impact
      riskFactors.push({ factor: `Moderate historical no-show rate (${noShowRate.toFixed(0)}%)`, impact })
      recommendations.push('Send multiple reminders before appointment')
    }
  } else {
    probability += 15
    riskFactors.push({ factor: 'New patient (no appointment history)', impact: 15 })
    recommendations.push('Send new patient welcome packet with clear directions')
  }

  // Time of day
  if (data.appointmentTime) {
    const hour = parseInt(data.appointmentTime.split(':')[0])
    if (hour < 9) {
      probability += 12
      riskFactors.push({ factor: 'Early morning appointment', impact: 12 })
      recommendations.push('Confirm appointment the evening before')
    } else if (hour > 16) {
      probability += 8
      riskFactors.push({ factor: 'Late afternoon appointment', impact: 8 })
    }
  }

  // Day of week
  if (data.appointmentDate) {
    const date = new Date(data.appointmentDate)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 1) {
      probability += 8
      riskFactors.push({ factor: 'Monday appointment', impact: 8 })
    } else if (dayOfWeek === 5) {
      probability += 6
      riskFactors.push({ factor: 'Friday appointment', impact: 6 })
    }
  }

  // Appointment type
  if (data.appointmentType === 'new-patient') {
    probability += 18
    riskFactors.push({ factor: 'New patient visit type', impact: 18 })
    recommendations.push('Send detailed preparation instructions and directions')
  } else if (data.appointmentType === 'follow-up') {
    probability += 5
    riskFactors.push({ factor: 'Follow-up visit', impact: 5 })
  }

  // Contact information
  if (!patient.phone && !patient.email) {
    probability += 20
    riskFactors.push({ factor: 'No contact information on file', impact: 20 })
    recommendations.push('Update patient contact information')
  }

  probability = Math.min(95, Math.max(5, probability))

  let riskLevel: 'low' | 'medium' | 'high'
  if (probability >= 50) {
    riskLevel = 'high'
    recommendations.push('Call patient to confirm attendance')
  } else if (probability >= 30) {
    riskLevel = 'medium'
    recommendations.push('Send reminder 24-48 hours before appointment')
  } else {
    riskLevel = 'low'
    if (recommendations.length === 0) {
      recommendations.push('Standard reminder protocol is sufficient')
    }
  }

  return {
    patientName: `${patient.firstName} ${patient.lastName}`,
    noShowProbability: probability,
    riskLevel,
    riskFactors,
    historicalNoShows: data.noShows,
    totalAppointments: data.totalPast,
    recommendations,
  }
}
