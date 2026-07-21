import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { createAuditLog } from '@/lib/audit'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'
import { sendTransactionalEmail } from '@/lib/email-delivery'

// POST - Send verification email
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    if (user.emailVerified) {
      return apiResponse({ message: 'Email is already verified.' })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`
    await sendTransactionalEmail(user.email, 'Verify your email', `<p>Use this one-time link within 24 hours: <a href="${verifyUrl}">Verify email</a></p>`)

    return apiResponse({ message: 'Verification email has been sent.' })
  } catch (error) {
    console.error('Send verification email error:', error)
    return apiError('Failed to send verification email', 500)
  }
}

// PUT - Verify email with token
export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return apiError('Verification token is required', 400)
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return apiError('Invalid or expired verification token', 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      entity: 'User',
      entityId: user.id,
    })

    return apiResponse({ message: 'Email verified successfully.' })
  } catch (error) {
    console.error('Verify email error:', error)
    return apiError('Failed to verify email', 500)
  }
}
