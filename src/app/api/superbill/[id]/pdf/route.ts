import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/utils'
import { generateSuperbillData } from '@/lib/superbill/generator'
import { renderToBuffer } from '@react-pdf/renderer'
import { SuperbillPDF } from '@/lib/superbill/pdf'
import { createElement } from 'react'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'

/**
 * GET /api/superbill/[id]/pdf - Generate and download superbill PDF
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

    // Find the superbill
    const superbill = await prisma.superbill.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: true,
      },
    })

    if (!superbill) {
      return apiError('Superbill not found', 404)
    }

    // Generate fresh superbill data
    const superbillData = await generateSuperbillData(superbill.encounterId)

    // Update with stored payment info
    superbillData.summary.amountPaid = Number(superbill.amountPaid)
    superbillData.summary.amountDue = superbillData.summary.patientEstimate - Number(superbill.amountPaid)
    superbillData.superbillNumber = superbill.superbillNumber

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      createElement(SuperbillPDF, { data: superbillData }) as any
    )

    // Update superbill with print timestamp
    await prisma.superbill.update({
      where: { id },
      data: { printedAt: new Date() },
    })

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'VIEW',
      entity: 'Superbill',
      entityId: superbill.id,
      patientId: superbill.patientId,
      changes: { action: 'pdf_generated' },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    // Return PDF
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="superbill-${superbill.superbillNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Failed to generate superbill PDF:', error)
    return apiError('Failed to generate PDF', 500)
  }
}

/**
 * POST /api/superbill/[id]/pdf - Generate PDF and save to storage
 */
export async function POST(
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

    // Find the superbill
    const superbill = await prisma.superbill.findUnique({
      where: { id },
    })

    if (!superbill) {
      return apiError('Superbill not found', 404)
    }

    // Generate fresh superbill data
    const superbillData = await generateSuperbillData(superbill.encounterId)

    // Update with stored payment info
    superbillData.summary.amountPaid = Number(superbill.amountPaid)
    superbillData.summary.amountDue = superbillData.summary.patientEstimate - Number(superbill.amountPaid)
    superbillData.superbillNumber = superbill.superbillNumber

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      createElement(SuperbillPDF, { data: superbillData }) as any
    )

    // Save PDF to document storage
    const fs = await import('fs/promises')
    const path = await import('path')

    const uploadDir = process.env.DOCUMENT_STORAGE_PATH || './uploads/documents'
    const pdfDir = path.join(uploadDir, 'superbills')
    await fs.mkdir(pdfDir, { recursive: true })

    const filename = `superbill-${superbill.superbillNumber}.pdf`
    const pdfPath = path.join(pdfDir, filename)
    await fs.writeFile(pdfPath, pdfBuffer)

    // Update superbill with PDF path
    const updatedSuperbill = await prisma.superbill.update({
      where: { id },
      data: {
        pdfPath: pdfPath,
        printedAt: new Date(),
      },
    })

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Superbill',
      entityId: superbill.id,
      patientId: superbill.patientId,
      changes: { action: 'pdf_saved', pdfPath },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return Response.json({
      success: true,
      superbill: updatedSuperbill,
      pdfPath,
    })
  } catch (error) {
    console.error('Failed to save superbill PDF:', error)
    return apiError('Failed to save PDF', 500)
  }
}
