import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

/**
 * GET /api/documents - List encrypted documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const patientId = searchParams.get('patientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (patientId) where.patientId = patientId

    const [documents, total] = await Promise.all([
      prisma.encryptedDocument.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.encryptedDocument.count({ where }),
    ])

    return apiResponse({
      documents: documents.map((doc) => ({
        id: doc.id,
        originalName: doc.originalName,
        category: doc.category,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        patientName: doc.patient
          ? `${doc.patient.firstName} ${doc.patient.lastName}`
          : null,
        accessLevel: doc.accessLevel,
        createdAt: doc.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to list documents:', error)
    return apiError('Failed to list documents', 500)
  }
}
