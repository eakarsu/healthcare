import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiError } from '@/lib/utils'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * GET /api/fax/[id]/download - Download fax document
 */
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

    // Find the fax
    const fax = await prisma.faxMessage.findUnique({
      where: { id },
    })

    if (!fax) {
      return apiError('Fax not found', 404)
    }

    if (!fax.documentPath) {
      return apiError('Fax document not available', 404)
    }

    // Check if file exists
    try {
      await fs.access(fax.documentPath)
    } catch {
      return apiError('Fax document file not found', 404)
    }

    // Read the file
    const fileBuffer = await fs.readFile(fax.documentPath)
    const filename = path.basename(fax.documentPath)

    // Log the access
    await createAuditLog({
      userId: session.user.id,
      action: 'VIEW',
      entity: 'FaxMessage',
      entityId: fax.id,
      patientId: fax.patientId || undefined,
      changes: { action: 'downloaded' },
      ipAddress,
      userAgent,
      phiAccessed: !!fax.patientId,
    })

    // Return the file
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Failed to download fax:', error)
    return apiError('Failed to download fax', 500)
  }
}
