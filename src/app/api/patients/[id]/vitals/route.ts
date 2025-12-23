import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    // Vitals are stored on encounters
    const encounters = await prisma.encounter.findMany({
      where: {
        patientId: params.id,
        OR: [
          { bloodPressureSystolic: { not: null } },
          { heartRate: { not: null } },
          { temperature: { not: null } },
          { weight: { not: null } },
        ],
      },
      select: {
        id: true,
        encounterDate: true,
        bloodPressureSystolic: true,
        bloodPressureDiastolic: true,
        heartRate: true,
        respiratoryRate: true,
        temperature: true,
        oxygenSaturation: true,
        height: true,
        weight: true,
        painLevel: true,
      },
      orderBy: { encounterDate: 'desc' },
      take: limit,
    })

    // Transform to vitals format
    const vitals = encounters.map(enc => ({
      id: enc.id,
      recordedAt: enc.encounterDate,
      bloodPressureSystolic: enc.bloodPressureSystolic,
      bloodPressureDiastolic: enc.bloodPressureDiastolic,
      heartRate: enc.heartRate,
      respiratoryRate: enc.respiratoryRate,
      temperature: enc.temperature,
      oxygenSaturation: enc.oxygenSaturation,
      height: enc.height,
      weight: enc.weight,
      painLevel: enc.painLevel,
    }))

    return NextResponse.json({ data: vitals })
  } catch (error) {
    console.error('Error fetching patient vitals:', error)
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      encounterId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      respiratoryRate,
      temperature,
      oxygenSaturation,
      height,
      weight,
      painLevel,
    } = body

    if (!encounterId) {
      return NextResponse.json({ error: 'Encounter ID is required' }, { status: 400 })
    }

    // Update the encounter with vitals
    const encounter = await prisma.encounter.update({
      where: { id: encounterId },
      data: {
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        respiratoryRate,
        temperature,
        oxygenSaturation,
        height,
        weight,
        painLevel,
      },
    })

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'ENCOUNTER_VITALS',
        entityId: encounterId,
        changes: {
          patientId: params.id,
          encounterId,
          vitals: {
            bp: bloodPressureSystolic && bloodPressureDiastolic
              ? `${bloodPressureSystolic}/${bloodPressureDiastolic}`
              : null,
            hr: heartRate,
            temp: temperature,
            o2: oxygenSaturation,
          },
        },
      },
    })

    return NextResponse.json({
      id: encounter.id,
      recordedAt: encounter.encounterDate,
      bloodPressureSystolic: encounter.bloodPressureSystolic,
      bloodPressureDiastolic: encounter.bloodPressureDiastolic,
      heartRate: encounter.heartRate,
      temperature: encounter.temperature,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vital:', error)
    return NextResponse.json({ error: 'Failed to create vital' }, { status: 500 })
  }
}
