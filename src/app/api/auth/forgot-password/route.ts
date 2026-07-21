import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import crypto from 'crypto'
import { sendTransactionalEmail } from '@/lib/email-delivery'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return apiError('Email is required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      return apiResponse({ message: 'If an account with that email exists, a password reset link has been sent.' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set token expiry to 1 hour
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    await sendTransactionalEmail(user.email, 'Password reset', `<p>Use this one-time link within one hour: <a href="${resetUrl}">Reset password</a></p>`)

    return apiResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return apiError('Failed to process password reset request', 500)
  }
}
