import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// Get single imaging study with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    const study = await prisma.imagingStudy.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            dateOfBirth: true
          }
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        order: true,
        series: {
          include: {
            instances: {
              select: {
                id: true,
                sopInstanceUid: true,
                instanceNumber: true,
                rows: true,
                columns: true,
                filePath: true
              },
              orderBy: { instanceNumber: 'asc' }
            }
          },
          orderBy: { seriesNumber: 'asc' }
        }
      }
    })

    if (!study) {
      return apiError('Imaging study not found', 404)
    }

    return apiResponse(study)
  } catch (error) {
    console.error('Failed to get imaging study:', error)
    return apiError('Failed to get imaging study', 500)
  }
}

// Update imaging study (add report, update status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const body = await request.json()
    const {
      status,
      findings,
      impression,
      reportedBy,
      aiAnalysis,
      aiConfidence,
      performedDate
    } = body

    const study = await prisma.imagingStudy.findUnique({
      where: { id }
    })

    if (!study) {
      return apiError('Study not found', 404)
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (findings !== undefined) updateData.findings = findings
    if (impression !== undefined) updateData.impression = impression
    if (performedDate) updateData.performedDate = new Date(performedDate)

    // If adding report, set reported fields
    if (findings || impression) {
      updateData.reportedBy = reportedBy || session.user?.email
      updateData.reportedAt = new Date()
      if (!status) updateData.status = 'REPORTED'
    }

    // AI analysis
    if (aiAnalysis) {
      updateData.aiAnalysis = aiAnalysis
      updateData.aiConfidence = aiConfidence
    }

    const updated = await prisma.imagingStudy.update({
      where: { id },
      data: updateData
    })

    return apiResponse(updated)
  } catch (error) {
    console.error('Failed to update imaging study:', error)
    return apiError('Failed to update imaging study', 500)
  }
}

// Delete imaging study
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    // Delete related series and instances first
    await prisma.imagingInstance.deleteMany({
      where: { series: { studyId: id } }
    })

    await prisma.imagingSeries.deleteMany({
      where: { studyId: id }
    })

    await prisma.imagingStudy.delete({
      where: { id }
    })

    return apiResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete imaging study:', error)
    return apiError('Failed to delete imaging study', 500)
  }
}
