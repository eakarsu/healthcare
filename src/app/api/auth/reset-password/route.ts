import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { createAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return apiError('Token and new password are required', 400)
    }

    if (password.length < 8) {
      return apiError('Password must be at least 8 characters long', 400)
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return apiError('Invalid or expired reset token', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLogins: 0,
        lockedUntil: null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: user.id,
    })

    return apiResponse({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return apiError('Failed to reset password', 500)
  }
}
