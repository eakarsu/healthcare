import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { reason, supportingDocuments, notes } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Appeal reason is required' },
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

    if (claim.status !== 'DENIED' && claim.status !== 'PARTIAL') {
      return NextResponse.json(
        { error: 'Only denied or partially paid claims can be appealed' },
        { status: 400 }
      )
    }

    // Update claim status to APPEALED and add appeal notes
    const updatedClaim = await prisma.claim.update({
      where: { id: (await params).id },
      data: {
        status: 'APPEALED',
        notes: `${claim.notes || ''}\n\n--- APPEAL (${new Date().toISOString()}) ---\nReason: ${reason}${notes ? `\nNotes: ${notes}` : ''}`.trim(),
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'CLAIM',
        entityId: (await params).id,
        changes: {
          action: 'APPEAL',
          claimNumber: claim.claimNumber,
          previousStatus: claim.status,
          appealReason: reason,
          supportingDocuments,
        },
      },
    })

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      message: 'Appeal submitted successfully',
    })
  } catch (error) {
    console.error('Error creating appeal:', error)
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 })
  }
}
