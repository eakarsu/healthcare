import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Public endpoint - no auth required for patient self-scheduling
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const practiceId = searchParams.get('practiceId')
    const providerId = searchParams.get('providerId')
    const locationId = searchParams.get('locationId')
    const appointmentTypeId = searchParams.get('appointmentTypeId')
    const date = searchParams.get('date') // YYYY-MM-DD format

    if (!practiceId) {
      return apiError('Practice ID is required', 400)
    }

    // Get online booking settings
    const settings = await prisma.onlineBookingSettings.findUnique({
      where: { practiceId }
    })

    if (!settings?.enabled) {
      return apiError('Online booking is not enabled for this practice', 400)
    }

    // Get available appointment types
    const appointmentTypes = await prisma.appointmentType.findMany({
      where: {
        allowOnline: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        requireDeposit: true,
        depositAmount: true
      }
    })

    // Get locations
    const locations = await prisma.location.findMany({
      where: {
        practiceId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        phone: true
      }
    })

    // Get providers with their schedules
    const providers = await prisma.provider.findMany({
      where: {
        practiceId,
        user: { isActive: true }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        schedules: true,
        locations: {
          include: { location: true }
        }
      }
    })

    // If date is provided, get available slots
    let availableSlots: Array<{ time: string; providerId: string; locationId: string }> = []

    if (date && providerId && locationId && appointmentTypeId) {
      const requestDate = new Date(date)
      const dayOfWeek = requestDate.getDay()

      const appointmentType = await prisma.appointmentType.findUnique({
        where: { id: appointmentTypeId }
      })

      if (!appointmentType) {
        return apiError('Appointment type not found', 404)
      }

      const provider = providers.find(p => p.id === providerId)
      const schedule = provider?.schedules.find(s => s.dayOfWeek === dayOfWeek)

      if (schedule?.isAvailable) {
        // Get existing appointments for this date
        const startOfDay = new Date(requestDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(requestDate)
        endOfDay.setHours(23, 59, 59, 999)

        const existingAppointments = await prisma.appointment.findMany({
          where: {
            providerId,
            locationId,
            scheduledStart: {
              gte: startOfDay,
              lte: endOfDay
            },
            status: {
              notIn: ['CANCELLED', 'NO_SHOW']
            }
          }
        })

        // Generate available slots
        const slotDuration = appointmentType.duration
        const [startHour, startMin] = schedule.startTime.split(':').map(Number)
        const [endHour, endMin] = schedule.endTime.split(':').map(Number)

        let currentTime = new Date(requestDate)
        currentTime.setHours(startHour, startMin, 0, 0)

        const endTime = new Date(requestDate)
        endTime.setHours(endHour, endMin, 0, 0)

        // Minimum lead time check
        const minLeadTime = new Date()
        minLeadTime.setHours(minLeadTime.getHours() + (settings.minLeadTimeHours || 24))

        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000)

          // Check if slot is available
          const isBooked = existingAppointments.some(apt => {
            const aptStart = new Date(apt.scheduledStart)
            const aptEnd = new Date(apt.scheduledEnd)
            return (currentTime < aptEnd && slotEnd > aptStart)
          })

          const isPastLeadTime = currentTime > minLeadTime

          if (!isBooked && isPastLeadTime) {
            availableSlots.push({
              time: currentTime.toISOString(),
              providerId,
              locationId
            })
          }

          currentTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000)
        }
      }
    }

    return apiResponse({
      settings: {
        minLeadTimeHours: settings.minLeadTimeHours,
        maxLeadTimeDays: settings.maxLeadTimeDays,
        cancellationHours: settings.cancellationHours,
        allowNewPatients: settings.allowNewPatients,
        welcomeMessage: settings.welcomeMessage
      },
      appointmentTypes,
      locations,
      providers: providers.map(p => ({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        title: p.title,
        specialty: p.specialty,
        locations: p.locations.map(l => l.locationId)
      })),
      availableSlots
    })
  } catch (error) {
    console.error('Failed to get booking info:', error)
    return apiError('Failed to get booking info', 500)
  }
}

// Create new booking request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      practiceId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      appointmentTypeId,
      providerId,
      locationId,
      requestedDate,
      requestedTime,
      reason,
      notes,
      insuranceInfo,
      isNewPatient
    } = body

    // Validate required fields
    if (!practiceId || !firstName || !lastName || !email || !phone ||
      !dateOfBirth || !appointmentTypeId || !providerId || !locationId ||
      !requestedDate || !requestedTime) {
      return apiError('Missing required fields', 400)
    }

    // Check booking settings
    const settings = await prisma.onlineBookingSettings.findUnique({
      where: { practiceId }
    })

    if (!settings?.enabled) {
      return apiError('Online booking is not enabled', 400)
    }

    if (isNewPatient && !settings.allowNewPatients) {
      return apiError('New patient booking is not enabled', 400)
    }

    // Check if patient already exists
    let patientId: string | null = null
    const existingPatient = await prisma.patient.findFirst({
      where: {
        practiceId,
        OR: [
          { email },
          {
            firstName: { equals: firstName, mode: 'insensitive' },
            lastName: { equals: lastName, mode: 'insensitive' },
            dateOfBirth: new Date(dateOfBirth)
          }
        ]
      }
    })

    if (existingPatient) {
      patientId = existingPatient.id
    }

    // Generate confirmation code
    const confirmationCode = nanoid(8).toUpperCase()

    // Create booking
    const booking = await prisma.onlineBooking.create({
      data: {
        confirmationCode,
        status: 'PENDING',
        patientId,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        isNewPatient: !existingPatient,
        appointmentTypeId,
        providerId,
        locationId,
        requestedDate: new Date(requestedDate),
        requestedTime,
        reason,
        notes,
        insuranceInfo
      },
      include: {
        appointmentType: true,
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } }
        },
        location: true
      }
    })

    // TODO: Send confirmation email

    return apiResponse({
      confirmationCode: booking.confirmationCode,
      status: booking.status,
      appointmentDetails: {
        date: booking.requestedDate,
        time: booking.requestedTime,
        type: booking.appointmentType.name,
        provider: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
        location: booking.location.name,
        address: `${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zip}`
      },
      message: 'Your booking request has been received. You will receive a confirmation email shortly.'
    }, 201)
  } catch (error) {
    console.error('Failed to create booking:', error)
    return apiError('Failed to create booking', 500)
  }
}
