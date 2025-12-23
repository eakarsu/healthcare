import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id: patientId } = await params
    const body = await request.json()
    const { name, type, category, fileSize, mimeType, description } = body

    if (!name || !type) {
      return apiError('Name and type are required', 400)
    }

    // Verify the patient belongs to this practice
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        practiceId: session.user.practiceId,
      },
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    // In a real application, you would:
    // 1. Upload the file to cloud storage (S3, Azure Blob, etc.)
    // 2. Get the file path/URL from the storage
    // For now, we create a placeholder file path
    const filePath = `/documents/${patientId}/${Date.now()}_${name.replace(/\s+/g, '_')}`

    const document = await prisma.patientDocument.create({
      data: {
        patientId,
        name,
        type: type as any,
        category: category || null,
        filePath,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        description: description || null,
      },
    })

    return apiResponse({ data: document }, 201)
  } catch (error) {
    console.error('Failed to upload document:', error)
    return apiError('Failed to upload document', 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id: patientId } = await params

    // Verify the patient belongs to this practice
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        practiceId: session.user.practiceId,
      },
    })

    if (!patient) {
      return apiError('Patient not found', 404)
    }

    const documents = await prisma.patientDocument.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })

    return apiResponse({ data: documents })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return apiError('Failed to fetch documents', 500)
  }
}
