import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadDocument } from '@/lib/document-storage'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import type { DocumentCategory } from '@/lib/document-storage/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as DocumentCategory | null
    const documentType = formData.get('documentType') as string | null
    const patientId = formData.get('patientId') as string | null
    const encounterId = formData.get('encounterId') as string | null
    const claimId = formData.get('claimId') as string | null

    if (!file) {
      return apiError('No file provided', 400)
    }

    if (!category) {
      return apiError('Category is required', 400)
    }

    if (!documentType) {
      return apiError('Document type is required', 400)
    }

    // Validate category
    const validCategories: DocumentCategory[] = ['CLINICAL', 'BILLING', 'ADMINISTRATIVE', 'FAX']
    if (!validCategories.includes(category)) {
      return apiError('Invalid category', 400)
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload document
    const document = await uploadDocument({
      buffer,
      originalName: file.name,
      category,
      documentType,
      patientId: patientId || undefined,
      encounterId: encounterId || undefined,
      claimId: claimId || undefined,
      createdBy: session.user.id,
    })

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'EncryptedDocument',
      entityId: document.id,
      patientId: patientId || undefined,
      changes: {
        originalName: file.name,
        category,
        documentType,
        fileSize: buffer.length,
      },
      ipAddress,
      userAgent,
      phiAccessed: !!patientId,
    })

    return apiResponse(document, 201)
  } catch (error) {
    console.error('Failed to upload document:', error)
    return apiError('Failed to upload document', 500)
  }
}
