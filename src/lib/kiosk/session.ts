import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

const SESSION_TIMEOUT_MINUTES = parseInt(
  process.env.KIOSK_SESSION_TIMEOUT_MINUTES || '10'
)

export interface KioskSessionData {
  sessionId: string
  sessionToken: string
  status: string
  appointmentId?: string
  patientId?: string
  verificationMethod?: string
  verifiedAt?: Date
  demographicsUpdated: boolean
  insuranceVerified: boolean
  consentsSigned: boolean
  copayCollected: number | null  // Amount collected, null if not collected
  paymentTransactionId?: string
  startedAt: Date
  expiresAt: Date
}

/**
 * Create a new kiosk session
 */
export async function createKioskSession(
  deviceId?: string,
  locationId?: string,
  appointmentId?: string
): Promise<KioskSessionData> {
  const sessionToken = nanoid(32)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000)

  let patientId: string | undefined

  // If appointment ID provided, get patient info
  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { patientId: true },
    })
    patientId = appointment?.patientId
  }

  const session = await prisma.kioskSession.create({
    data: {
      sessionToken,
      status: appointmentId ? 'VERIFICATION' : 'LOOKUP',
      appointmentId,
      patientId,
      deviceId,
      locationId,
      startedAt: now,
      demographicsUpdated: false,
      insuranceVerified: false,
      consentsSigned: false,
      copayCollected: null,
    },
  })

  return {
    sessionId: session.id,
    sessionToken: session.sessionToken,
    status: session.status,
    appointmentId: session.appointmentId || undefined,
    patientId: session.patientId || undefined,
    demographicsUpdated: session.demographicsUpdated,
    insuranceVerified: session.insuranceVerified,
    consentsSigned: session.consentsSigned,
    copayCollected: session.copayCollected ? Number(session.copayCollected) : null,
    startedAt: session.startedAt,
    expiresAt,
  }
}

/**
 * Get kiosk session by token
 */
export async function getKioskSession(
  sessionToken: string
): Promise<KioskSessionData | null> {
  const session = await prisma.kioskSession.findFirst({
    where: {
      sessionToken,
      status: { not: 'EXPIRED' },
    },
  })

  if (!session) {
    return null
  }

  // Check if expired
  const expiresAt = new Date(
    session.startedAt.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000
  )
  if (new Date() > expiresAt) {
    // Mark as expired
    await prisma.kioskSession.update({
      where: { id: session.id },
      data: { status: 'EXPIRED' },
    })
    return null
  }

  return {
    sessionId: session.id,
    sessionToken: session.sessionToken,
    status: session.status,
    appointmentId: session.appointmentId || undefined,
    patientId: session.patientId || undefined,
    verificationMethod: session.verificationMethod || undefined,
    verifiedAt: session.verifiedAt || undefined,
    demographicsUpdated: session.demographicsUpdated,
    insuranceVerified: session.insuranceVerified,
    consentsSigned: session.consentsSigned,
    copayCollected: session.copayCollected ? Number(session.copayCollected) : null,
    paymentTransactionId: session.paymentTransactionId || undefined,
    startedAt: session.startedAt,
    expiresAt,
  }
}

/**
 * Update kiosk session
 */
export async function updateKioskSession(
  sessionToken: string,
  updates: Partial<{
    status: string
    appointmentId: string
    patientId: string
    verificationMethod: string
    verifiedAt: Date
    demographicsUpdated: boolean
    insuranceVerified: boolean
    consentsSigned: boolean
    copayCollected: number | null
    paymentTransactionId: string
    completedAt: Date
  }>
): Promise<KioskSessionData | null> {
  const session = await getKioskSession(sessionToken)
  if (!session) {
    return null
  }

  const updated = await prisma.kioskSession.update({
    where: { id: session.sessionId },
    data: {
      ...updates,
      copayCollected: updates.copayCollected !== undefined ? updates.copayCollected : undefined,
    },
  })

  return {
    sessionId: updated.id,
    sessionToken: updated.sessionToken,
    status: updated.status,
    appointmentId: updated.appointmentId || undefined,
    patientId: updated.patientId || undefined,
    verificationMethod: updated.verificationMethod || undefined,
    verifiedAt: updated.verifiedAt || undefined,
    demographicsUpdated: updated.demographicsUpdated,
    insuranceVerified: updated.insuranceVerified,
    consentsSigned: updated.consentsSigned,
    copayCollected: updated.copayCollected ? Number(updated.copayCollected) : null,
    paymentTransactionId: updated.paymentTransactionId || undefined,
    startedAt: updated.startedAt,
    expiresAt: session.expiresAt,
  }
}

/**
 * Complete kiosk session
 */
export async function completeKioskSession(
  sessionToken: string
): Promise<boolean> {
  const session = await getKioskSession(sessionToken)
  if (!session) {
    return false
  }

  await prisma.kioskSession.update({
    where: { id: session.sessionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })

  // Update appointment if linked
  if (session.appointmentId) {
    await prisma.appointment.update({
      where: { id: session.appointmentId },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
    })
  }

  return true
}

/**
 * Expire old sessions
 */
export async function expireOldSessions(): Promise<number> {
  const cutoffTime = new Date(
    Date.now() - SESSION_TIMEOUT_MINUTES * 60 * 1000
  )

  const result = await prisma.kioskSession.updateMany({
    where: {
      status: { in: ['LOOKUP', 'VERIFICATION', 'DEMOGRAPHICS', 'INSURANCE', 'CONSENTS', 'PAYMENT'] },
      startedAt: { lt: cutoffTime },
    },
    data: {
      status: 'EXPIRED',
    },
  })

  return result.count
}
