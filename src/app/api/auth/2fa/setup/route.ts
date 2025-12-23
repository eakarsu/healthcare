import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate OTP Auth URL
    const otpAuthUrl = authenticator.keyuri(
      session.user.email,
      'Healthcare Practice AI',
      secret
    )

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpAuthUrl)

    return NextResponse.json({
      secret,
      qrCode,
      otpAuthUrl,
    })
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}
