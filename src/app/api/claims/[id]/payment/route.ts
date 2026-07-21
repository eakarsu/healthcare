import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await prisma.claimPayment.findMany({
      where: { claimId: (await params).id },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('Error fetching claim payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      paymentDate,
      amount,
      payerType,
      checkNumber,
      reference,
      allowedAmount,
      adjustmentAmount,
      patientResponsibility,
    } = body

    if (!paymentDate || amount === undefined || !payerType) {
      return NextResponse.json(
        { error: 'Payment date, amount, and payer type are required' },
        { status: 400 }
      )
    }

    const claim = await prisma.claim.findUnique({
      where: { id: (await params).id },
      include: { patient: true },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Create payment
    const payment = await prisma.claimPayment.create({
      data: {
        claimId: (await params).id,
        paymentDate: new Date(paymentDate),
        amount,
        payerType,
        checkNumber,
        reference,
      },
    })

    // Update claim with payment info
    const totalPaid = await prisma.claimPayment.aggregate({
      where: { claimId: (await params).id },
      _sum: { amount: true },
    })

    const paidSum = totalPaid._sum.amount?.toNumber() ?? 0
    const chargesTotal = claim.totalCharges ? Number(claim.totalCharges) : 0
    const newStatus = paidSum >= chargesTotal ? 'PAID' : 'PARTIAL'

    await prisma.claim.update({
      where: { id: (await params).id },
      data: {
        paidAmount: totalPaid._sum.amount || 0,
        allowedAmount: allowedAmount ?? claim.allowedAmount,
        adjustmentAmount: adjustmentAmount ?? claim.adjustmentAmount,
        patientResponsibility: patientResponsibility ?? claim.patientResponsibility,
        status: newStatus,
        processedDate: new Date(),
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'CLAIM_PAYMENT',
        entityId: payment.id,
        changes: {
          claimId: (await params).id,
          claimNumber: claim.claimNumber,
          amount,
          payerType,
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error recording claim payment:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}
