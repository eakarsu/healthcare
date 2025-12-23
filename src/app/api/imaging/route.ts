import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Get imaging studies
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const modality = searchParams.get('modality')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (modality) where.modality = modality

    const [studies, total] = await Promise.all([
      prisma.imagingStudy.findMany({
        where,
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true, mrn: true }
          },
          provider: {
            include: { user: { select: { firstName: true, lastName: true } } }
          },
          series: {
            select: {
              id: true,
              seriesNumber: true,
              modality: true,
              description: true,
              instanceCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.imagingStudy.count({ where })
    ])

    return apiResponse({
      studies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to get imaging studies:', error)
    return apiError('Failed to get imaging studies', 500)
  }
}

// Create new imaging study (from order or DICOM import)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      patientId,
      providerId,
      orderId,
      modality,
      bodyPart,
      studyDescription,
      scheduledDate,
      studyInstanceUid,
      storageLocation
    } = body

    if (!patientId || !modality) {
      return apiError('Patient ID and modality are required', 400)
    }

    // Generate accession number
    const accessionNumber = `ACC-${nanoid(10).toUpperCase()}`

    const study = await prisma.imagingStudy.create({
      data: {
        accessionNumber,
        patientId,
        providerId,
        orderId,
        modality,
        bodyPart,
        studyDescription,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        studyInstanceUid,
        storageLocation,
        status: scheduledDate ? 'SCHEDULED' : 'IN_PROGRESS'
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    return apiResponse(study, 201)
  } catch (error) {
    console.error('Failed to create imaging study:', error)
    return apiError('Failed to create imaging study', 500)
  }
}
