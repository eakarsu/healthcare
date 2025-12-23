import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Get document from database including file content
    const document = await prisma.encryptedDocument.findUnique({
      where: { id },
      select: {
        patientId: true,
        originalName: true,
        mimeType: true,
        fileContent: true,
        fileSize: true,
      },
    })

    if (!document) {
      return apiError('Document not found', 404)
    }

    if (!document.fileContent) {
      return apiError('Document content not available', 404)
    }

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'READ',
      entity: 'EncryptedDocument',
      entityId: id,
      patientId: document.patientId || undefined,
      ipAddress,
      userAgent,
      phiAccessed: !!document.patientId,
    })

    // Return file as response
    return new Response(document.fileContent, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.originalName}"`,
        'Content-Length': document.fileContent.length.toString(),
      },
    })
  } catch (error) {
    console.error('Failed to download document:', error)
    return apiError('Failed to download document', 500)
  }
}
