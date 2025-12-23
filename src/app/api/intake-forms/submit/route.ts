import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// Public endpoint for patients to submit intake forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      formId,
      patientId,
      appointmentId,
      responses,
      signatureData
    } = body

    if (!formId || !responses) {
      return apiError('Form ID and responses are required', 400)
    }

    const form = await prisma.intakeForm.findUnique({
      where: { id: formId }
    })

    if (!form) {
      return apiError('Form not found', 404)
    }

    if (!form.isActive) {
      return apiError('Form is no longer active', 400)
    }

    // Validate signature if required
    if (form.requiresSignature && !signatureData) {
      return apiError('Signature is required for this form', 400)
    }

    // Calculate expiration date
    let expiresAt: Date | null = null
    if (form.expirationDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + form.expirationDays)
    }

    const submission = await prisma.intakeFormSubmission.create({
      data: {
        formId,
        patientId,
        appointmentId,
        responses,
        signatureData,
        signedAt: signatureData ? new Date() : null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        expiresAt
      },
      include: {
        form: {
          select: { name: true, type: true }
        }
      }
    })

    return apiResponse({
      id: submission.id,
      formName: submission.form.name,
      submittedAt: submission.submittedAt,
      message: 'Form submitted successfully'
    }, 201)
  } catch (error) {
    console.error('Failed to submit intake form:', error)
    return apiError('Failed to submit form', 500)
  }
}

// Get submissions for patient (public with patient verification)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const email = searchParams.get('email')

    if (!appointmentId && !email) {
      return apiError('Appointment ID or email required', 400)
    }

    // For appointment-based lookup
    if (appointmentId) {
      const submissions = await prisma.intakeFormSubmission.findMany({
        where: { appointmentId },
        include: {
          form: {
            select: { name: true, type: true, requiresSignature: true }
          }
        }
      })

      // Also get pending forms for this appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          location: {
            include: { practice: true }
          }
        }
      })

      if (!appointment) {
        return apiError('Appointment not found', 404)
      }

      const allForms = await prisma.intakeForm.findMany({
        where: {
          practiceId: appointment.location.practiceId,
          isActive: true
        }
      })

      const pendingForms = allForms.filter(form =>
        !submissions.some(s => s.formId === form.id)
      )

      return apiResponse({
        submitted: submissions,
        pending: pendingForms.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          description: f.description,
          isRequired: f.isRequired
        }))
      })
    }

    return apiError('Not implemented', 501)
  } catch (error) {
    console.error('Failed to get submissions:', error)
    return apiError('Failed to get submissions', 500)
  }
}
