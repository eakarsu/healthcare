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

    const consents = await prisma.patientConsent.findMany({
      where: { patientId: (await params).id },
      orderBy: { signedDate: 'desc' },
    })

    return NextResponse.json({ data: consents })
  } catch (error) {
    console.error('Error fetching patient consents:', error)
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 })
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
      type,
      signedDate,
      expiresDate,
      signatureFile,
      ipAddress,
    } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Consent type is required' },
        { status: 400 }
      )
    }

    const consent = await prisma.patientConsent.create({
      data: {
        patientId: (await params).id,
        type,
        signedDate: signedDate ? new Date(signedDate) : new Date(),
        expiresDate: expiresDate ? new Date(expiresDate) : null,
        signatureFile,
        ipAddress,
        status: 'signed',
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'PATIENT_CONSENT',
        entityId: consent.id,
        changes: {
          patientId: (await params).id,
          consentType: type,
          signedDate: consent.signedDate?.toISOString(),
        },
      },
    })

    return NextResponse.json(consent, { status: 201 })
  } catch (error) {
    console.error('Error creating consent:', error)
    return NextResponse.json({ error: 'Failed to create consent' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const consentId = searchParams.get('consentId')

    if (!consentId) {
      return NextResponse.json({ error: 'Consent ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status, expiresDate } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (expiresDate !== undefined) updateData.expiresDate = expiresDate ? new Date(expiresDate) : null

    const consent = await prisma.patientConsent.update({
      where: { id: consentId },
      data: updateData,
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'PATIENT_CONSENT',
        entityId: consentId,
        changes: {
          patientId: (await params).id,
          changes: body,
        },
      },
    })

    return NextResponse.json(consent)
  } catch (error) {
    console.error('Error updating consent:', error)
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 })
  }
}
