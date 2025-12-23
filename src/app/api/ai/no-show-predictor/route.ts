import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch upcoming appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledStart: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        patient: true,
        provider: {
          include: {
            user: true,
          },
        },
        type: true,
      },
      orderBy: {
        scheduledStart: 'asc',
      },
      take: 20,
    })

    // Calculate no-show probability (in production, this would use ML models)
    const predictions = appointments.map((apt) => {
      let probability = 15 // Base probability
      const riskFactors: string[] = []
      const suggestedActions: string[] = []

      // Time of day factor
      const hour = new Date(apt.scheduledStart).getHours()
      if (hour < 9 || hour > 16) {
        probability += 10
        riskFactors.push('Off-peak time slot')
      }

      // Day of week factor
      const day = new Date(apt.scheduledStart).getDay()
      if (day === 1) {
        probability += 5
        riskFactors.push('Monday appointment')
      }
      if (day === 5) {
        probability += 5
        riskFactors.push('Friday appointment')
      }

      // New patient factor
      if (apt.isNewPatient) {
        probability += 15
        riskFactors.push('New patient')
        suggestedActions.push('Send new patient welcome packet')
      }

      // Appointment type factor
      if (apt.type.name.toLowerCase().includes('follow')) {
        probability += 5
        riskFactors.push('Follow-up appointment')
      }

      // Confirmation status
      if (apt.status !== 'CONFIRMED') {
        probability += 20
        riskFactors.push('Not confirmed')
        suggestedActions.push('Send confirmation reminder')
      }

      // Cap probability
      probability = Math.min(probability, 95)

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high'
      if (probability >= 50) riskLevel = 'high'
      else if (probability >= 30) riskLevel = 'medium'
      else riskLevel = 'low'

      // Add default suggested actions
      if (probability >= 50) {
        suggestedActions.push('Consider overbooking this slot')
        suggestedActions.push('Call patient to confirm attendance')
      } else if (probability >= 30) {
        suggestedActions.push('Send reminder 24 hours before')
      }

      return {
        id: apt.id,
        patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
        patientPhone: apt.patient.phone || 'N/A',
        appointmentDate: format(new Date(apt.scheduledStart), 'MMM d, yyyy'),
        appointmentTime: format(new Date(apt.scheduledStart), 'h:mm a'),
        appointmentType: apt.type.name,
        provider: `${apt.provider.user.firstName} ${apt.provider.user.lastName}`,
        noShowProbability: probability,
        riskLevel,
        riskFactors,
        suggestedActions,
        lastConfirmation: apt.confirmedAt ? format(new Date(apt.confirmedAt), 'MMM d, h:mm a') : null,
      }
    })

    // Sort by probability descending
    predictions.sort((a, b) => b.noShowProbability - a.noShowProbability)

    return NextResponse.json({ appointments: predictions })
  } catch (error) {
    console.error('No-show prediction error:', error)
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
  }
}
