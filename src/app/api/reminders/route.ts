import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// Get appointment reminders
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const status = searchParams.get('status')
    const pending = searchParams.get('pending') === 'true'

    const where: Record<string, unknown> = {}
    if (appointmentId) where.appointmentId = appointmentId
    if (status) where.status = status
    if (pending) {
      where.status = 'PENDING'
      where.scheduledFor = { lte: new Date() }
    }

    const reminders = await prisma.appointmentReminder.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            },
            provider: {
              include: { user: { select: { firstName: true, lastName: true } } }
            },
            type: true
          }
        }
      },
      orderBy: { scheduledFor: 'asc' }
    })

    return apiResponse(reminders)
  } catch (error) {
    console.error('Failed to get reminders:', error)
    return apiError('Failed to get reminders', 500)
  }
}

// Create reminders for appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const { appointmentId, types, channel } = body

    if (!appointmentId) {
      return apiError('Appointment ID is required', 400)
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        type: true
      }
    })

    if (!appointment) {
      return apiError('Appointment not found', 404)
    }

    const appointmentTime = new Date(appointment.scheduledStart)
    const remindersToCreate: Array<{
      appointmentId: string
      type: 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_2H' | 'FOLLOWUP' | 'RECALL' | 'CUSTOM'
      channel: string
      scheduledFor: Date
      message: string
    }> = []

    const defaultChannel = channel || (appointment.patient.email ? 'EMAIL' : 'SMS')
    const reminderTypes = types || ['CONFIRMATION', 'REMINDER_24H', 'REMINDER_2H']

    for (const type of reminderTypes) {
      let scheduledFor: Date
      let message: string

      switch (type) {
        case 'CONFIRMATION':
          scheduledFor = new Date() // Send immediately
          message = `Hi ${appointment.patient.firstName}, your appointment is confirmed for ${appointmentTime.toLocaleDateString()} at ${appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Reply C to confirm or call us to reschedule.`
          break

        case 'REMINDER_24H':
          scheduledFor = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000)
          message = `Reminder: You have an appointment tomorrow at ${appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Reply C to confirm.`
          break

        case 'REMINDER_2H':
          scheduledFor = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000)
          message = `Your appointment is in 2 hours at ${appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please arrive 15 minutes early.`
          break

        default:
          continue
      }

      // Only create if scheduled time is in the future
      if (scheduledFor > new Date()) {
        remindersToCreate.push({
          appointmentId,
          type: type as 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_2H' | 'FOLLOWUP' | 'RECALL' | 'CUSTOM',
          channel: defaultChannel,
          scheduledFor,
          message
        })
      }
    }

    if (remindersToCreate.length === 0) {
      return apiResponse({ created: 0, message: 'No reminders to create (all times have passed)' })
    }

    await prisma.appointmentReminder.createMany({
      data: remindersToCreate
    })

    return apiResponse({
      created: remindersToCreate.length,
      reminders: remindersToCreate
    }, 201)
  } catch (error) {
    console.error('Failed to create reminders:', error)
    return apiError('Failed to create reminders', 500)
  }
}

// Process and send pending reminders (called by cron job)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { action } = await request.json()

    if (action !== 'PROCESS_PENDING') {
      return apiError('Invalid action', 400)
    }

    // Get pending reminders that are due
    const pendingReminders = await prisma.appointmentReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() }
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        }
      },
      take: 50 // Process in batches
    })

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const reminder of pendingReminders) {
      results.processed++

      try {
        // In production, integrate with Twilio/SendGrid
        // For now, simulate sending
        const sent = await simulateSendReminder(reminder)

        if (sent) {
          await prisma.appointmentReminder.update({
            where: { id: reminder.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              deliveryStatus: 'DELIVERED'
            }
          })
          results.sent++
        } else {
          throw new Error('Send failed')
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Reminder ${reminder.id}: ${(error as Error).message}`)

        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            errorMessage: (error as Error).message
          }
        })
      }
    }

    return apiResponse(results)
  } catch (error) {
    console.error('Failed to process reminders:', error)
    return apiError('Failed to process reminders', 500)
  }
}

// Simulate sending reminder (replace with actual Twilio/SendGrid in production)
async function simulateSendReminder(reminder: {
  channel: string
  message: string | null
  appointment: {
    patient: {
      firstName: string
      lastName: string
      email: string | null
      phone: string | null
    }
  }
}): Promise<boolean> {
  // In production:
  // - For SMS: Use Twilio
  // - For EMAIL: Use SendGrid/Nodemailer
  // - For VOICE: Use Twilio Voice

  console.log(`[SIMULATED ${reminder.channel}] To: ${reminder.appointment.patient.firstName} ${reminder.appointment.patient.lastName}`)
  console.log(`Message: ${reminder.message}`)

  // Simulate 95% success rate
  return Math.random() > 0.05
}
