import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import crypto from 'crypto'

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

    // In production, send email with reset link
    // For now, log the token (would use nodemailer in production)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log(`Password reset link for ${email}: ${resetUrl}`)

    // TODO: Send email using nodemailer
    // await sendPasswordResetEmail(user.email, resetUrl)

    return apiResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return apiError('Failed to process password reset request', 500)
  }
}
