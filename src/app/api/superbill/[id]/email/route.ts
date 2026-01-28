import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, extractRequestInfo } from '@/lib/audit'
import { apiResponse, apiError } from '@/lib/utils'
import { generateSuperbillData } from '@/lib/superbill/generator'
import { renderToBuffer } from '@react-pdf/renderer'
import { SuperbillPDF } from '@/lib/superbill/pdf'
import { createElement } from 'react'

/**
 * POST /api/superbill/[id]/email - Email superbill to patient
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
    const body = await request.json()
    const { email: customEmail, subject, message } = body
    const { ipAddress, userAgent } = extractRequestInfo(request)

    // Find the superbill with patient info
    const superbill = await prisma.superbill.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: {
          include: {
            provider: {
              include: {
                user: true,
                practice: true,
              },
            },
          },
        },
      },
    })

    if (!superbill) {
      return apiError('Superbill not found', 404)
    }

    // Get provider from encounter
    const provider = superbill.encounter.provider

    // Get email address
    const toEmail = customEmail || superbill.patient.email
    if (!toEmail) {
      return apiError('Patient does not have an email address on file', 400)
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

    // Prepare email
    const practice = provider.practice
    const emailSubject = subject || `Your Visit Summary - ${superbill.superbillNumber}`
    const emailMessage = message || getDefaultEmailMessage(
      superbill.patient.firstName,
      practice.name,
      superbillData.visit.date,
      superbillData.summary.amountDue
    )

    // Send email (using existing email service if available, otherwise log)
    const emailSent = await sendSuperbillEmail({
      to: toEmail,
      subject: emailSubject,
      message: emailMessage,
      attachment: {
        filename: `superbill-${superbill.superbillNumber}.pdf`,
        content: pdfBuffer,
      },
      practice: {
        name: practice.name,
        email: practice.email || undefined,
      },
    })

    if (!emailSent) {
      return apiError('Failed to send email', 500)
    }

    // Update superbill with email timestamp
    await prisma.superbill.update({
      where: { id },
      data: { emailedAt: new Date() },
    })

    // Log the action
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Superbill',
      entityId: superbill.id,
      patientId: superbill.patientId,
      changes: { action: 'emailed', recipient: toEmail },
      ipAddress,
      userAgent,
      phiAccessed: true,
    })

    return apiResponse({
      success: true,
      message: `Superbill emailed to ${toEmail}`,
      emailedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to email superbill:', error)
    return apiError('Failed to email superbill', 500)
  }
}

/**
 * Send superbill email
 */
async function sendSuperbillEmail(options: {
  to: string
  subject: string
  message: string
  attachment: {
    filename: string
    content: Buffer
  }
  practice: {
    name: string
    email?: string
  }
}): Promise<boolean> {
  // Check if nodemailer is configured
  const smtpHost = process.env.EMAIL_SMTP_HOST
  const smtpUser = process.env.EMAIL_SMTP_USER

  if (smtpHost && smtpUser) {
    try {
      const nodemailer = await import('nodemailer')

      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
        secure: process.env.EMAIL_SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: process.env.EMAIL_SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: options.practice.email || smtpUser,
        to: options.to,
        subject: options.subject,
        html: formatEmailHtml(options.message, options.practice.name),
        attachments: [
          {
            filename: options.attachment.filename,
            content: options.attachment.content,
            contentType: 'application/pdf',
          },
        ],
      })

      return true
    } catch (error) {
      console.error('Failed to send email via SMTP:', error)
      return false
    }
  }

  // Fallback: Log email details (for development)
  console.log('Email would be sent (SMTP not configured):')
  console.log('  To:', options.to)
  console.log('  Subject:', options.subject)
  console.log('  Attachment:', options.attachment.filename)
  console.log('  Message:', options.message)

  // In development, consider this a success
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return false
}

/**
 * Get default email message
 */
function getDefaultEmailMessage(
  patientFirstName: string,
  practiceName: string,
  visitDate: string,
  amountDue: number
): string {
  return `
Dear ${patientFirstName},

Thank you for visiting ${practiceName} on ${visitDate}.

Attached is your visit summary (superbill) for your records. This document contains:
- Services provided during your visit
- Diagnosis codes
- Charges and estimated patient responsibility

${amountDue > 0 ? `Your estimated balance due is $${amountDue.toFixed(2)}. We will file your insurance claim and send you a statement once we receive the explanation of benefits.` : 'Your copay has been collected. We will file your insurance claim and contact you if there is any additional balance.'}

If you have any questions about your visit or charges, please don't hesitate to contact our office.

Best regards,
${practiceName}
`.trim()
}

/**
 * Format email as HTML
 */
function formatEmailHtml(message: string, practiceName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0066cc; margin: 0; font-size: 24px; }
    .content { margin-bottom: 30px; }
    .footer { border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${practiceName}</h1>
    </div>
    <div class="content">
      ${message.split('\n').map((line) => `<p>${line}</p>`).join('')}
    </div>
    <div class="footer">
      <p>This email contains confidential health information. If you received this in error, please delete it and notify the sender.</p>
    </div>
  </div>
</body>
</html>
`.trim()
}
