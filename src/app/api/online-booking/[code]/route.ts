import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { nanoid } from 'nanoid'

// Get booking by confirmation code (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const booking = await prisma.onlineBooking.findUnique({
      where: { confirmationCode: code },
      include: {
        appointmentType: true,
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        location: true
      }
    })

    if (!booking) {
      return apiError('Booking not found', 404)
    }

    return apiResponse({
      confirmationCode: booking.confirmationCode,
      status: booking.status,
      firstName: booking.firstName,
      lastName: booking.lastName,
      appointmentDetails: {
        date: booking.requestedDate,
        time: booking.requestedTime,
        type: booking.appointmentType.name,
        provider: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
        location: booking.location.name,
        address: `${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zip}`
      },
      confirmedAt: booking.confirmedAt
    })
  } catch (error) {
    console.error('Failed to get booking:', error)
    return apiError('Failed to get booking', 500)
  }
}

// Cancel booking (public with confirmation code)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { email } = await request.json()

    const booking = await prisma.onlineBooking.findUnique({
      where: { confirmationCode: code }
    })

    if (!booking) {
      return apiError('Booking not found', 404)
    }

    // Verify email matches
    if (booking.email.toLowerCase() !== email.toLowerCase()) {
      return apiError('Email does not match booking', 403)
    }

    if (booking.status === 'CANCELLED') {
      return apiError('Booking is already cancelled', 400)
    }

    if (booking.status === 'COMPLETED') {
      return apiError('Cannot cancel completed booking', 400)
    }

    // Check cancellation window
    const settings = await prisma.onlineBookingSettings.findFirst({
      where: {
        practice: {
          locations: {
            some: { id: booking.locationId }
          }
        }
      }
    })

    const appointmentTime = new Date(booking.requestedDate)
    const [hours, minutes] = booking.requestedTime.split(':').map(Number)
    appointmentTime.setHours(hours, minutes)

    const hoursUntilAppointment = (appointmentTime.getTime() - Date.now()) / (1000 * 60 * 60)
    const cancellationHours = settings?.cancellationHours || 24

    if (hoursUntilAppointment < cancellationHours) {
      return apiResponse({
        success: false,
        message: `Cancellations must be made at least ${cancellationHours} hours before the appointment. Please call the office to cancel.`
      })
    }

    // Cancel the booking
    await prisma.onlineBooking.update({
      where: { confirmationCode: code },
      data: { status: 'CANCELLED' }
    })

    // If appointment was created, cancel it too
    if (booking.appointmentId) {
      await prisma.appointment.update({
        where: { id: booking.appointmentId },
        data: { status: 'CANCELLED' }
      })
    }

    return apiResponse({
      success: true,
      message: 'Your booking has been cancelled successfully.'
    })
  } catch (error) {
    console.error('Failed to cancel booking:', error)
    return apiError('Failed to cancel booking', 500)
  }
}

// Confirm booking (staff only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { code } = await params
    const { action } = await request.json()

    const booking = await prisma.onlineBooking.findUnique({
      where: { confirmationCode: code },
      include: {
        appointmentType: true,
        location: true
      }
    })

    if (!booking) {
      return apiError('Booking not found', 404)
    }

    if (action === 'confirm') {
      // Create patient if new
      let patientId = booking.patientId

      if (!patientId) {
        const newPatient = await prisma.patient.create({
          data: {
            mrn: `MRN-${nanoid(8).toUpperCase()}`,
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
            dateOfBirth: booking.dateOfBirth,
            gender: 'UNKNOWN',
            practiceId: booking.location.practiceId
          }
        })
        patientId = newPatient.id
      }

      // Create appointment
      const appointmentTime = new Date(booking.requestedDate)
      const [hours, minutes] = booking.requestedTime.split(':').map(Number)
      appointmentTime.setHours(hours, minutes)

      const endTime = new Date(appointmentTime.getTime() + booking.appointmentType.duration * 60 * 1000)

      const appointment = await prisma.appointment.create({
        data: {
          appointmentTypeId: booking.appointmentTypeId,
          patientId,
          providerId: booking.providerId,
          locationId: booking.locationId,
          scheduledStart: appointmentTime,
          scheduledEnd: endTime,
          chiefComplaint: booking.reason,
          notes: booking.notes,
          isNewPatient: booking.isNewPatient,
          status: 'CONFIRMED'
        }
      })

      // Update booking
      const updated = await prisma.onlineBooking.update({
        where: { confirmationCode: code },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          appointmentId: appointment.id,
          patientId
        }
      })

      // TODO: Send confirmation email to patient

      return apiResponse({
        success: true,
        appointmentId: appointment.id,
        patientId
      })
    } else if (action === 'reject') {
      await prisma.onlineBooking.update({
        where: { confirmationCode: code },
        data: { status: 'CANCELLED' }
      })

      // TODO: Send rejection email to patient

      return apiResponse({ success: true })
    }

    return apiError('Invalid action', 400)
  } catch (error) {
    console.error('Failed to process booking:', error)
    return apiError('Failed to process booking', 500)
  }
}
