import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { getKioskSession, updateKioskSession } from '@/lib/kiosk/session'

/**
 * GET /api/kiosk/payment - Get payment amount due
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session || !session.patientId) {
      return apiError('Session not found or patient not verified', 404)
    }

    // Get appointment details and estimated copay
    let copayAmount = 0
    let appointmentType = 'General Visit'

    if (session.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: session.appointmentId },
        include: {
          appointmentType: true,
        },
      })

      if (appointment) {
        appointmentType = appointment.appointmentType?.name || 'General Visit'
        // In production, this would come from eligibility check
        copayAmount = appointment.appointmentType?.defaultCopay
          ? Number(appointment.appointmentType.defaultCopay)
          : 25
      }
    }

    // Get patient's outstanding balance
    const outstandingBalance = await getPatientBalance(session.patientId)

    return apiResponse({
      payment: {
        copayAmount,
        outstandingBalance,
        totalDue: copayAmount + outstandingBalance,
        appointmentType,
        paymentEnabled: !!process.env.STRIPE_SECRET_KEY,
      },
    })
  } catch (error) {
    console.error('Failed to get payment info:', error)
    return apiError('Failed to get payment info', 500)
  }
}

/**
 * POST /api/kiosk/payment - Process payment
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-kiosk-session')

    if (!sessionToken) {
      return apiError('Session token is required', 400)
    }

    const session = await getKioskSession(sessionToken)
    if (!session || !session.patientId) {
      return apiError('Session not found or patient not verified', 404)
    }

    const body = await request.json()
    const {
      amount,
      paymentMethod, // 'card', 'skip', 'defer'
      paymentToken, // From payment processor
    } = body

    if (!paymentMethod) {
      return apiError('Payment method is required', 400)
    }

    let paymentTransactionId: string | undefined

    if (paymentMethod === 'card' && amount > 0) {
      // Process card payment
      // In production, this would integrate with Stripe/Square
      if (!paymentToken && process.env.STRIPE_SECRET_KEY) {
        return apiError('Payment token is required for card payments', 400)
      }

      // Mock payment processing
      paymentTransactionId = `PAY-${Date.now()}`

      // Record payment
      await prisma.payment.create({
        data: {
          amount,
          patientId: session.patientId,
          paymentMethod: 'CREDIT_CARD',
          paymentDate: new Date(),
          referenceNumber: paymentTransactionId,
          notes: 'Kiosk copay payment',
          status: 'COMPLETED',
        },
      })
    }

    // Update session
    await updateKioskSession(sessionToken, {
      status: 'READY',
      copayCollected: paymentMethod === 'card' && amount > 0,
      paymentTransactionId,
    })

    return apiResponse({
      success: true,
      paymentStatus: paymentMethod === 'card' ? 'processed' : paymentMethod,
      transactionId: paymentTransactionId,
      nextStep: 'complete',
    })
  } catch (error) {
    console.error('Failed to process payment:', error)
    return apiError('Failed to process payment', 500)
  }
}

/**
 * Get patient's outstanding balance
 */
async function getPatientBalance(patientId: string): Promise<number> {
  // Sum of all unpaid claims minus payments
  const claims = await prisma.claim.aggregate({
    where: {
      patientId,
      status: { in: ['ACCEPTED', 'PAID', 'PARTIALLY_PAID'] },
    },
    _sum: {
      patientResponsibility: true,
    },
  })

  const payments = await prisma.payment.aggregate({
    where: {
      patientId,
      status: 'COMPLETED',
    },
    _sum: {
      amount: true,
    },
  })

  const totalResponsibility = Number(claims._sum.patientResponsibility || 0)
  const totalPayments = Number(payments._sum.amount || 0)

  return Math.max(0, totalResponsibility - totalPayments)
}
