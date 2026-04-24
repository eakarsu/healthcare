import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'
import { createAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return apiError('Current password and new password are required', 400)
    }

    if (newPassword.length < 8) {
      return apiError('New password must be at least 8 characters long', 400)
    }

    if (currentPassword === newPassword) {
      return apiError('New password must be different from current password', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return apiError('Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await createAuditLog({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user.id,
    })

    return apiResponse({ message: 'Password changed successfully.' })
  } catch (error) {
    console.error('Change password error:', error)
    return apiError('Failed to change password', 500)
  }
}
