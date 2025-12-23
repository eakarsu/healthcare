import { prisma } from '@/lib/prisma'

export type VerificationMethod = 'DOB_NAME' | 'PHONE_DOB' | 'LAST4_DOB' | 'BARCODE'

export interface VerificationRequest {
  method: VerificationMethod
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  last4SSN?: string
  barcode?: string
  appointmentId?: string
}

export interface VerificationResult {
  success: boolean
  patientId?: string
  appointmentId?: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    hasUpcomingAppointment: boolean
  }
  appointment?: {
    id: string
    scheduledStart: Date
    appointmentType: string
    provider: string
  }
  message?: string
}

/**
 * Verify patient identity for kiosk check-in
 */
export async function verifyPatient(
  request: VerificationRequest
): Promise<VerificationResult> {
  const { method, appointmentId } = request

  switch (method) {
    case 'DOB_NAME':
      return verifyByNameAndDOB(request)
    case 'PHONE_DOB':
      return verifyByPhoneAndDOB(request)
    case 'LAST4_DOB':
      return verifyByLast4AndDOB(request)
    case 'BARCODE':
      return verifyByBarcode(request)
    default:
      return { success: false, message: 'Invalid verification method' }
  }
}

/**
 * Verify by first name, last name, and date of birth
 */
async function verifyByNameAndDOB(
  request: VerificationRequest
): Promise<VerificationResult> {
  const { firstName, lastName, dateOfBirth, appointmentId } = request

  if (!firstName || !lastName || !dateOfBirth) {
    return { success: false, message: 'First name, last name, and date of birth are required' }
  }

  const dob = new Date(dateOfBirth)

  // Find patient
  const patient = await prisma.patient.findFirst({
    where: {
      firstName: { equals: firstName, mode: 'insensitive' },
      lastName: { equals: lastName, mode: 'insensitive' },
      dateOfBirth: dob,
    },
    include: {
      appointments: {
        where: {
          scheduledStart: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          provider: {
            include: { user: true },
          },
          appointmentType: true,
        },
        orderBy: { scheduledStart: 'asc' },
        take: 1,
      },
    },
  })

  if (!patient) {
    return { success: false, message: 'Patient not found. Please check your information.' }
  }

  const upcomingAppointment = patient.appointments[0]

  // If specific appointment requested, verify it matches
  if (appointmentId && (!upcomingAppointment || upcomingAppointment.id !== appointmentId)) {
    return { success: false, message: 'Appointment not found for this patient' }
  }

  return buildSuccessResult(patient, upcomingAppointment)
}

/**
 * Verify by phone number and date of birth
 */
async function verifyByPhoneAndDOB(
  request: VerificationRequest
): Promise<VerificationResult> {
  const { phone, dateOfBirth } = request

  if (!phone || !dateOfBirth) {
    return { success: false, message: 'Phone number and date of birth are required' }
  }

  const dob = new Date(dateOfBirth)
  const cleanPhone = phone.replace(/\D/g, '')

  const patient = await prisma.patient.findFirst({
    where: {
      dateOfBirth: dob,
      OR: [
        { phone: { contains: cleanPhone } },
        { mobilePhone: { contains: cleanPhone } },
      ],
    },
    include: {
      appointments: {
        where: {
          scheduledStart: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          provider: {
            include: { user: true },
          },
          appointmentType: true,
        },
        orderBy: { scheduledStart: 'asc' },
        take: 1,
      },
    },
  })

  if (!patient) {
    return { success: false, message: 'Patient not found. Please check your information.' }
  }

  return buildSuccessResult(patient, patient.appointments[0])
}

/**
 * Verify by last 4 SSN and date of birth
 */
async function verifyByLast4AndDOB(
  request: VerificationRequest
): Promise<VerificationResult> {
  const { last4SSN, dateOfBirth } = request

  if (!last4SSN || !dateOfBirth) {
    return { success: false, message: 'Last 4 SSN and date of birth are required' }
  }

  if (!/^\d{4}$/.test(last4SSN)) {
    return { success: false, message: 'Invalid last 4 SSN format' }
  }

  const dob = new Date(dateOfBirth)

  // Note: In production, SSN would be encrypted. This is simplified.
  const patient = await prisma.patient.findFirst({
    where: {
      dateOfBirth: dob,
      ssn: { endsWith: last4SSN },
    },
    include: {
      appointments: {
        where: {
          scheduledStart: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          provider: {
            include: { user: true },
          },
          appointmentType: true,
        },
        orderBy: { scheduledStart: 'asc' },
        take: 1,
      },
    },
  })

  if (!patient) {
    return { success: false, message: 'Patient not found. Please check your information.' }
  }

  return buildSuccessResult(patient, patient.appointments[0])
}

/**
 * Verify by barcode (appointment confirmation number or patient ID)
 */
async function verifyByBarcode(
  request: VerificationRequest
): Promise<VerificationResult> {
  const { barcode } = request

  if (!barcode) {
    return { success: false, message: 'Barcode is required' }
  }

  // Try to find appointment by confirmation code
  const appointment = await prisma.appointment.findFirst({
    where: {
      OR: [
        { id: barcode },
        { confirmationCode: barcode },
      ],
      scheduledStart: {
        gte: new Date(),
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      patient: true,
      provider: {
        include: { user: true },
      },
      appointmentType: true,
    },
  })

  if (appointment) {
    return buildSuccessResult(appointment.patient, appointment)
  }

  // Try to find patient by ID
  const patient = await prisma.patient.findUnique({
    where: { id: barcode },
    include: {
      appointments: {
        where: {
          scheduledStart: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          provider: {
            include: { user: true },
          },
          appointmentType: true,
        },
        orderBy: { scheduledStart: 'asc' },
        take: 1,
      },
    },
  })

  if (patient) {
    return buildSuccessResult(patient, patient.appointments[0])
  }

  return { success: false, message: 'Invalid barcode. Please try again.' }
}

/**
 * Build success result
 */
function buildSuccessResult(
  patient: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: Date
  },
  appointment?: {
    id: string
    scheduledStart: Date
    provider: { user: { firstName: string; lastName: string } }
    appointmentType: { name: string } | null
  }
): VerificationResult {
  return {
    success: true,
    patientId: patient.id,
    appointmentId: appointment?.id,
    patient: {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      hasUpcomingAppointment: !!appointment,
    },
    appointment: appointment
      ? {
          id: appointment.id,
          scheduledStart: appointment.scheduledStart,
          appointmentType: appointment.appointmentType?.name || 'General Visit',
          provider: `${appointment.provider.user.firstName} ${appointment.provider.user.lastName}`,
        }
      : undefined,
  }
}
