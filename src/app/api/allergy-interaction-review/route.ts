import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    feature: 'Allergy Interaction Review',
    summary: { patientsReviewed: 68, severeAllergyFlags: 6, medConflicts: 9, chartUpdatesNeeded: 12 },
    conflicts: [
      { patient: 'Nora Ellis', allergy: 'Penicillin anaphylaxis', order: 'Amoxicillin', severity: 'critical', action: 'Block eRx and suggest non-beta-lactam alternative' },
      { patient: 'Calvin Reed', allergy: 'Sulfa rash', order: 'TMP-SMX', severity: 'high', action: 'Route to provider for substitute antibiotic' },
      { patient: 'Imani Brooks', allergy: 'Latex', order: 'Procedure kit', severity: 'medium', action: 'Add latex-free room prep task' },
    ],
    checks: ['Medication allergies', 'Food/excipient allergies', 'Procedure supplies', 'Contrast reactions', 'Chart reconciliation'],
  })
}
