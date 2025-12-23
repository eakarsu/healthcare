import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch patients and their conditions for this practice
    // If no practiceId in session, fetch all patients (for development)
    const whereClause = session.user.practiceId
      ? { practiceId: session.user.practiceId }
      : {}

    const patients = await prisma.patient.findMany({
      where: whereClause,
      take: 50,
      include: {
        conditions: true,
        medications: true,
        allergies: true,
        encounters: {
          orderBy: { encounterDate: 'desc' },
          take: 1,
          select: { encounterDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate risk scores (in production, this would use ML models)
    const patientRisks = patients.map((patient) => {
      let riskScore = 20 // Base score
      const riskFactors: string[] = []

      // Age factor
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
      if (age >= 65) {
        riskScore += 20
        riskFactors.push('Age 65+')
      } else if (age >= 50) {
        riskScore += 10
        riskFactors.push('Age 50-64')
      }

      // Conditions factor
      const conditionNames = patient.conditions.map(c => c.name.toLowerCase())
      if (conditionNames.some(c => c.includes('diabetes'))) {
        riskScore += 15
        riskFactors.push('Diabetes')
      }
      if (conditionNames.some(c => c.includes('hypertension'))) {
        riskScore += 10
        riskFactors.push('Hypertension')
      }
      if (conditionNames.some(c => c.includes('heart') || c.includes('cardiac'))) {
        riskScore += 20
        riskFactors.push('Cardiac condition')
      }
      if (conditionNames.some(c => c.includes('copd') || c.includes('asthma'))) {
        riskScore += 10
        riskFactors.push('Respiratory condition')
      }

      // Multiple medications
      if (patient.medications.length >= 5) {
        riskScore += 10
        riskFactors.push('Polypharmacy (5+ meds)')
      }

      // Cap at 100
      riskScore = Math.min(riskScore, 100)

      // Determine risk level
      let riskLevel: 'low' | 'moderate' | 'high' | 'critical'
      if (riskScore >= 80) riskLevel = 'critical'
      else if (riskScore >= 60) riskLevel = 'high'
      else if (riskScore >= 40) riskLevel = 'moderate'
      else riskLevel = 'low'

      // Generate recommended actions
      const recommendedActions: string[] = []
      if (riskLevel === 'critical' || riskLevel === 'high') {
        recommendedActions.push('Schedule care coordination call')
        recommendedActions.push('Review medication list for optimization')
      }
      if (riskFactors.includes('Diabetes')) {
        recommendedActions.push('Ensure A1C test within last 3 months')
      }
      if (riskFactors.includes('Hypertension')) {
        recommendedActions.push('Verify home BP monitoring')
      }
      if (age >= 65) {
        recommendedActions.push('Review fall risk assessment')
        recommendedActions.push('Update advance directives')
      }

      return {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        age,
        riskScore,
        riskLevel,
        riskFactors,
        conditions: patient.conditions.map(c => c.name),
        lastVisit: patient.encounters[0]?.encounterDate
          ? new Date(patient.encounters[0].encounterDate).toLocaleDateString()
          : 'No visits recorded',
        recommendedActions,
      }
    })

    // Sort by risk score descending
    patientRisks.sort((a, b) => b.riskScore - a.riskScore)

    return NextResponse.json({ patients: patientRisks })
  } catch (error) {
    console.error('Risk stratification error:', error)
    return NextResponse.json({ error: 'Failed to fetch risk data' }, { status: 500 })
  }
}
