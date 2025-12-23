import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      action: 'CREATE',
      entity: 'ELIGIBILITY_VERIFICATION',
    }

    if (patientId) {
      where.details = {
        path: ['patientId'],
        equals: patientId,
      }
    }

    const verifications = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Transform to more usable format
    const history = verifications.map((v) => ({
      id: v.id,
      date: v.createdAt,
      verifiedBy: `${v.user.firstName} ${v.user.lastName}`,
      patientId: (v.changes as any)?.patientId,
      patientName: (v.changes as any)?.patientName,
      insurancePlan: (v.changes as any)?.insurancePlan,
      status: (v.changes as any)?.status,
      isEligible: (v.changes as any)?.isEligible,
      coverageDetails: (v.changes as any)?.coverageDetails,
    }))

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('Error fetching eligibility history:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
