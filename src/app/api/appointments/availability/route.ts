import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMinutes, parseISO, format, eachDayOfInterval, setHours, setMinutes, isBefore, isAfter } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const providerId = searchParams.get('providerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const duration = parseInt(searchParams.get('duration') || '30')

    if (!providerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Provider ID, start date, and end date are required' },
        { status: 400 }
      )
    }

    const start = parseISO(startDate)
    const end = parseISO(endDate)

    // Get provider's schedule
    const providerSchedules = await prisma.providerSchedule.findMany({
      where: { providerId },
    })

    // Get existing appointments
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        scheduledStart: { gte: start },
        scheduledEnd: { lte: end },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: {
        scheduledStart: true,
        scheduledEnd: true,
      },
    })

    // Generate available slots
    const availableSlots: { date: string; time: string; datetime: string }[] = []
    const days = eachDayOfInterval({ start, end })

    for (const day of days) {
      const dayOfWeek = day.getDay()
      const schedule = providerSchedules.find((s) => s.dayOfWeek === dayOfWeek)

      if (!schedule || !schedule.isAvailable) continue

      const [startHour, startMin] = schedule.startTime.split(':').map(Number)
      const [endHour, endMin] = schedule.endTime.split(':').map(Number)

      let slotStart = setMinutes(setHours(day, startHour), startMin)
      const dayEnd = setMinutes(setHours(day, endHour), endMin)

      while (isBefore(addMinutes(slotStart, duration), dayEnd) ||
             addMinutes(slotStart, duration).getTime() === dayEnd.getTime()) {
        const slotEnd = addMinutes(slotStart, duration)

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((appt) => {
          const apptStart = new Date(appt.scheduledStart)
          const apptEnd = new Date(appt.scheduledEnd)
          return (
            (slotStart >= apptStart && slotStart < apptEnd) ||
            (slotEnd > apptStart && slotEnd <= apptEnd) ||
            (slotStart <= apptStart && slotEnd >= apptEnd)
          )
        })

        if (!hasConflict && isAfter(slotStart, new Date())) {
          availableSlots.push({
            date: format(day, 'yyyy-MM-dd'),
            time: format(slotStart, 'HH:mm'),
            datetime: slotStart.toISOString(),
          })
        }

        slotStart = addMinutes(slotStart, schedule.slotDuration || 30)
      }
    }

    return NextResponse.json({ data: availableSlots })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
