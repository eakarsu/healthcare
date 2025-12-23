import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { reportId } = await params
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const practiceId = session.user.practiceId

    // Default date range: current month
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()
    end.setHours(23, 59, 59, 999)

    let data: Record<string, unknown>[] = []

    switch (reportId) {
      case 'financial-summary':
        data = await getFinancialSummary(practiceId, start, end)
        break
      case 'production-by-provider':
        data = await getProductionByProvider(practiceId, start, end)
        break
      case 'ar-aging':
        data = await getARAgingReport(practiceId)
        break
      case 'payer-analysis':
        data = await getPayerAnalysis(practiceId, start, end)
        break
      case 'patient-volume':
        data = await getPatientVolume(practiceId, start, end)
        break
      case 'appointment-analysis':
        data = await getAppointmentAnalysis(practiceId, start, end)
        break
      case 'new-patients':
        data = await getNewPatients(practiceId, start, end)
        break
      case 'procedure-analysis':
        data = await getProcedureAnalysis(practiceId, start, end)
        break
      case 'diagnosis-report':
        data = await getDiagnosisReport(practiceId, start, end)
        break
      default:
        return apiError('Report not found', 404)
    }

    return apiResponse({ data })
  } catch (error) {
    console.error('Failed to generate report:', error)
    return apiError('Failed to generate report', 500)
  }
}

async function getFinancialSummary(practiceId: string, start: Date, end: Date) {
  const claims = await prisma.claim.findMany({
    where: {
      provider: { practiceId },
      serviceDate: { gte: start, lte: end },
    },
    select: {
      claimNumber: true,
      serviceDate: true,
      totalCharges: true,
      paidAmount: true,
      adjustmentAmount: true,
      status: true,
      patient: { select: { firstName: true, lastName: true } },
      insurancePlan: { select: { payerName: true } },
    },
  })

  return claims.map(c => ({
    'Claim Number': c.claimNumber,
    'Service Date': c.serviceDate.toISOString().split('T')[0],
    'Patient': `${c.patient.lastName}, ${c.patient.firstName}`,
    'Payer': c.insurancePlan?.payerName || 'Self-Pay',
    'Total Charges': Number(c.totalCharges) || 0,
    'Paid Amount': Number(c.paidAmount) || 0,
    'Adjustments': Number(c.adjustmentAmount) || 0,
    'Balance': (Number(c.totalCharges) || 0) - (Number(c.paidAmount) || 0) - (Number(c.adjustmentAmount) || 0),
    'Status': c.status,
  }))
}

async function getProductionByProvider(practiceId: string, start: Date, end: Date) {
  const providers = await prisma.provider.findMany({
    where: { practiceId },
    include: {
      user: { select: { firstName: true, lastName: true } },
      claims: {
        where: { serviceDate: { gte: start, lte: end } },
        select: {
          totalCharges: true,
          paidAmount: true,
          adjustmentAmount: true,
        },
      },
    },
  })

  return providers.map(p => {
    const totalCharges = p.claims.reduce((sum, c) => sum + (Number(c.totalCharges) || 0), 0)
    const totalPaid = p.claims.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0)
    const totalAdjustments = p.claims.reduce((sum, c) => sum + (Number(c.adjustmentAmount) || 0), 0)
    return {
      'Provider': `Dr. ${p.user.firstName} ${p.user.lastName}`,
      'NPI': p.npi,
      'Specialty': p.specialty,
      'Total Charges': totalCharges,
      'Collections': totalPaid,
      'Adjustments': totalAdjustments,
      'Net': totalCharges - totalAdjustments,
      'Claim Count': p.claims.length,
    }
  })
}

async function getARAgingReport(practiceId: string) {
  const claims = await prisma.claim.findMany({
    where: {
      status: { notIn: ['PAID', 'VOID'] },
      provider: { practiceId },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, mrn: true } },
      insurancePlan: { select: { payerName: true } },
    },
  })

  const now = new Date()
  return claims.map(c => {
    const balance = (Number(c.totalCharges) || 0) - (Number(c.paidAmount) || 0) - (Number(c.adjustmentAmount) || 0)
    const daysOld = Math.floor((now.getTime() - new Date(c.serviceDate).getTime()) / (1000 * 60 * 60 * 24))
    let agingBucket = '0-30'
    if (daysOld > 120) agingBucket = '120+'
    else if (daysOld > 90) agingBucket = '91-120'
    else if (daysOld > 60) agingBucket = '61-90'
    else if (daysOld > 30) agingBucket = '31-60'

    return {
      'Claim Number': c.claimNumber,
      'Patient': `${c.patient.lastName}, ${c.patient.firstName}`,
      'MRN': c.patient.mrn,
      'Payer': c.insurancePlan?.payerName || 'Self-Pay',
      'Service Date': c.serviceDate.toISOString().split('T')[0],
      'Days Old': daysOld,
      'Aging Bucket': agingBucket,
      'Balance': balance,
      'Status': c.status,
    }
  }).filter(c => c.Balance > 0)
}

async function getPayerAnalysis(practiceId: string, start: Date, end: Date) {
  const claims = await prisma.claim.groupBy({
    by: ['insurancePlanId'],
    where: {
      provider: { practiceId },
      serviceDate: { gte: start, lte: end },
    },
    _sum: {
      totalCharges: true,
      paidAmount: true,
      adjustmentAmount: true,
    },
    _count: true,
  })

  const plans = await prisma.insurancePlan.findMany({
    where: { id: { in: claims.map(c => c.insurancePlanId) } },
  })

  return claims.map(c => {
    const plan = plans.find(p => p.id === c.insurancePlanId)
    const charges = Number(c._sum.totalCharges) || 0
    const paid = Number(c._sum.paidAmount) || 0
    return {
      'Payer': plan?.payerName || 'Unknown',
      'Plan': plan?.name || 'Unknown',
      'Claim Count': c._count,
      'Total Charges': charges,
      'Total Paid': paid,
      'Total Adjustments': Number(c._sum.adjustmentAmount) || 0,
      'Collection Rate': charges > 0 ? ((paid / charges) * 100).toFixed(1) + '%' : '0%',
    }
  })
}

async function getPatientVolume(practiceId: string, start: Date, end: Date) {
  const appointments = await prisma.appointment.findMany({
    where: {
      provider: { practiceId },
      scheduledStart: { gte: start, lte: end },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, mrn: true } },
      provider: { include: { user: { select: { firstName: true, lastName: true } } } },
      type: { select: { name: true } },
    },
    orderBy: { scheduledStart: 'asc' },
  })

  return appointments.map(a => ({
    'Date': a.scheduledStart.toISOString().split('T')[0],
    'Time': a.scheduledStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    'Patient': `${a.patient.lastName}, ${a.patient.firstName}`,
    'MRN': a.patient.mrn,
    'Provider': `Dr. ${a.provider.user.firstName} ${a.provider.user.lastName}`,
    'Type': a.type.name,
    'Status': a.status,
  }))
}

async function getAppointmentAnalysis(practiceId: string, start: Date, end: Date) {
  const appointments = await prisma.appointment.groupBy({
    by: ['status'],
    where: {
      provider: { practiceId },
      scheduledStart: { gte: start, lte: end },
    },
    _count: true,
  })

  const total = appointments.reduce((sum, a) => sum + a._count, 0)

  return appointments.map(a => ({
    'Status': a.status,
    'Count': a._count,
    'Percentage': total > 0 ? ((a._count / total) * 100).toFixed(1) + '%' : '0%',
  }))
}

async function getNewPatients(practiceId: string, start: Date, end: Date) {
  const patients = await prisma.patient.findMany({
    where: {
      practiceId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: 'desc' },
  })

  return patients.map(p => ({
    'Registration Date': p.createdAt.toISOString().split('T')[0],
    'MRN': p.mrn,
    'Name': `${p.lastName}, ${p.firstName}`,
    'Date of Birth': p.dateOfBirth.toISOString().split('T')[0],
    'Gender': p.gender,
    'Phone': p.phone || '-',
    'Email': p.email || '-',
  }))
}

async function getProcedureAnalysis(practiceId: string, start: Date, end: Date) {
  const procedures = await prisma.encounterProcedure.findMany({
    where: {
      encounter: {
        provider: { practiceId },
        encounterDate: { gte: start, lte: end },
      },
    },
    select: {
      cptCode: true,
      description: true,
    },
  })

  // Count procedures by CPT code
  const counts: Record<string, { description: string; count: number }> = {}
  procedures.forEach(p => {
    if (!counts[p.cptCode]) {
      counts[p.cptCode] = { description: p.description, count: 0 }
    }
    counts[p.cptCode].count++
  })

  return Object.entries(counts)
    .map(([code, data]) => ({
      'CPT Code': code,
      'Description': data.description,
      'Count': data.count,
    }))
    .sort((a, b) => b.Count - a.Count)
}

async function getDiagnosisReport(practiceId: string, start: Date, end: Date) {
  const diagnoses = await prisma.encounterDiagnosis.findMany({
    where: {
      encounter: {
        provider: { practiceId },
        encounterDate: { gte: start, lte: end },
      },
    },
    select: {
      icdCode: true,
      description: true,
      sequence: true,
    },
  })

  // Count diagnoses by ICD code (sequence 1 = primary)
  const counts: Record<string, { description: string; count: number; primaryCount: number }> = {}
  diagnoses.forEach(d => {
    if (!counts[d.icdCode]) {
      counts[d.icdCode] = { description: d.description, count: 0, primaryCount: 0 }
    }
    counts[d.icdCode].count++
    if (d.sequence === 1) counts[d.icdCode].primaryCount++
  })

  return Object.entries(counts)
    .map(([code, data]) => ({
      'ICD-10 Code': code,
      'Description': data.description,
      'Total Count': data.count,
      'Primary Diagnosis Count': data.primaryCount,
    }))
    .sort((a, b) => b['Total Count'] - a['Total Count'])
}
