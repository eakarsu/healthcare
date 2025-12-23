import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const providerId = searchParams.get('providerId')

    const start = startDate ? new Date(startDate) : startOfMonth(new Date())
    const end = endDate ? new Date(endDate) : endOfMonth(new Date())

    switch (reportType) {
      case 'revenue':
        return generateRevenueReport(start, end, providerId)
      case 'appointments':
        return generateAppointmentReport(start, end, providerId)
      case 'claims':
        return generateClaimsReport(start, end, providerId)
      case 'patients':
        return generatePatientReport(start, end)
      case 'productivity':
        return generateProductivityReport(start, end, providerId)
      default:
        return generateDashboardReport(start, end)
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function generateRevenueReport(start: Date, end: Date, providerId: string | null) {
  const where: any = {
    serviceDate: { gte: start, lte: end },
  }
  if (providerId) {
    where.providerId = providerId
  }

  const [claims, payments] = await Promise.all([
    prisma.claim.aggregate({
      where,
      _sum: {
        totalCharges: true,
        paidAmount: true,
        adjustmentAmount: true,
        patientResponsibility: true,
      },
      _count: true,
    }),
    prisma.patientPayment.aggregate({
      where: {
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  // Get monthly breakdown
  const monthlyRevenue = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "serviceDate") as month,
      SUM("totalCharges") as charges,
      SUM("paidAmount") as paid
    FROM "Claim"
    WHERE "serviceDate" >= ${start} AND "serviceDate" <= ${end}
    GROUP BY DATE_TRUNC('month', "serviceDate")
    ORDER BY month
  `

  return NextResponse.json({
    type: 'revenue',
    period: { start, end },
    summary: {
      totalCharges: claims._sum.totalCharges || 0,
      totalPaid: claims._sum.paidAmount || 0,
      totalAdjustments: claims._sum.adjustmentAmount || 0,
      patientResponsibility: claims._sum.patientResponsibility || 0,
      patientPayments: payments._sum.amount || 0,
      claimCount: claims._count,
      paymentCount: payments._count,
    },
    monthly: monthlyRevenue,
  })
}

async function generateAppointmentReport(start: Date, end: Date, providerId: string | null) {
  const where: any = {
    scheduledStart: { gte: start, lte: end },
  }
  if (providerId) {
    where.providerId = providerId
  }

  const appointments = await prisma.appointment.groupBy({
    by: ['status'],
    where,
    _count: true,
  })

  const byType = await prisma.appointment.groupBy({
    by: ['appointmentTypeId'],
    where,
    _count: true,
  })

  const types = await prisma.appointmentType.findMany({
    select: { id: true, name: true },
  })

  const typeMap = new Map(types.map((t) => [t.id, t.name]))

  return NextResponse.json({
    type: 'appointments',
    period: { start, end },
    byStatus: appointments.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>),
    byType: byType.map((t) => ({
      type: typeMap.get(t.appointmentTypeId) || 'Unknown',
      count: t._count,
    })),
    total: appointments.reduce((sum, a) => sum + a._count, 0),
  })
}

async function generateClaimsReport(start: Date, end: Date, providerId: string | null) {
  const where: any = {
    serviceDate: { gte: start, lte: end },
  }
  if (providerId) {
    where.providerId = providerId
  }

  const byStatus = await prisma.claim.groupBy({
    by: ['status'],
    where,
    _count: true,
    _sum: { totalCharges: true, paidAmount: true },
  })

  const deniedClaims = await prisma.claim.findMany({
    where: { ...where, status: 'DENIED' },
    select: {
      claimNumber: true,
      denialReason: true,
      denialCode: true,
      totalCharges: true,
    },
    take: 20,
  })

  return NextResponse.json({
    type: 'claims',
    period: { start, end },
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      totalCharges: s._sum.totalCharges || 0,
      totalPaid: s._sum.paidAmount || 0,
    })),
    deniedClaims,
  })
}

async function generatePatientReport(start: Date, end: Date) {
  const [newPatients, activePatients, patientsByGender] = await Promise.all([
    prisma.patient.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    }),
    prisma.patient.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.patient.groupBy({
      by: ['gender'],
      _count: true,
    }),
  ])

  return NextResponse.json({
    type: 'patients',
    period: { start, end },
    summary: {
      newPatients,
      activePatients,
    },
    demographics: {
      byGender: patientsByGender.reduce((acc, curr) => {
        acc[curr.gender] = curr._count
        return acc
      }, {} as Record<string, number>),
    },
  })
}

async function generateProductivityReport(start: Date, end: Date, providerId: string | null) {
  const where: any = {
    encounterDate: { gte: start, lte: end },
  }
  if (providerId) {
    where.providerId = providerId
  }

  const encounters = await prisma.encounter.groupBy({
    by: ['providerId'],
    where,
    _count: true,
  })

  const providers = await prisma.provider.findMany({
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  })

  const providerMap = new Map(
    providers.map((p) => [p.id, `Dr. ${p.user.firstName} ${p.user.lastName}`])
  )

  return NextResponse.json({
    type: 'productivity',
    period: { start, end },
    byProvider: encounters.map((e) => ({
      provider: providerMap.get(e.providerId) || 'Unknown',
      encounterCount: e._count,
    })),
  })
}

async function generateDashboardReport(start: Date, end: Date) {
  const [revenue, appointments, claims, patients] = await Promise.all([
    generateRevenueReport(start, end, null),
    generateAppointmentReport(start, end, null),
    generateClaimsReport(start, end, null),
    generatePatientReport(start, end),
  ])

  return NextResponse.json({
    type: 'dashboard',
    period: { start, end },
    revenue: await revenue.json(),
    appointments: await appointments.json(),
    claims: await claims.json(),
    patients: await patients.json(),
  })
}
