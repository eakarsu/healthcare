import { PrismaClient, AppointmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding appointments for today...')

  // Get practice
  const practice = await prisma.practice.findFirst()
  if (!practice) {
    console.error('No practice found')
    return
  }

  // Get providers
  const providers = await prisma.provider.findMany({
    where: { practiceId: practice.id },
    include: { user: true }
  })
  if (providers.length === 0) {
    console.error('No providers found')
    return
  }

  // Get patients
  const patients = await prisma.patient.findMany({
    where: { practiceId: practice.id },
    take: 20
  })
  if (patients.length === 0) {
    console.error('No patients found')
    return
  }

  // Get appointment types
  const appointmentTypes = await prisma.appointmentType.findMany()
  if (appointmentTypes.length === 0) {
    console.error('No appointment types found')
    return
  }

  // Get location (required)
  const location = await prisma.location.findFirst({ where: { practiceId: practice.id } })
  if (!location) {
    console.error('No location found')
    return
  }

  // Create appointments for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const chiefComplaints = [
    'Annual physical examination',
    'Follow-up for hypertension',
    'Persistent cough for 2 weeks',
    'Lower back pain',
    'Severe headache',
    'Skin rash on arms',
    'Joint pain in knee',
    'Fatigue and weakness',
    'Chest discomfort',
    'Weight management consultation',
    'Anxiety and stress',
    'Shortness of breath',
    'Abdominal pain',
    'Dizziness episodes',
    'Ear infection',
    'Sore throat',
    'Flu-like symptoms',
    'Medication review',
    'Lab results discussion',
    'New patient intake',
  ]

  const appointmentStatuses = [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
  ]

  // Delete existing today's appointments to avoid duplicates (optional)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  await prisma.appointment.deleteMany({
    where: {
      scheduledStart: {
        gte: today,
        lte: todayEnd
      },
      id: {
        startsWith: 'appt-new-'
      }
    }
  })

  // Create 18 appointments spread throughout the day
  const appointmentsToCreate = 18
  const startHour = 8

  for (let i = 0; i < appointmentsToCreate; i++) {
    const patient = patients[i % patients.length]
    const provider = providers[i % providers.length]
    const type = appointmentTypes[i % appointmentTypes.length]
    const status = appointmentStatuses[i % appointmentStatuses.length]

    // Calculate time slot (30-minute intervals starting at 8am)
    const appointmentTime = new Date(today)
    const hourOffset = Math.floor(i / 2) // 2 appointments per hour
    const minuteOffset = (i % 2) * 30 // 0 or 30 minutes
    appointmentTime.setHours(startHour + hourOffset, minuteOffset, 0, 0)

    const endTime = new Date(appointmentTime)
    endTime.setMinutes(endTime.getMinutes() + type.duration)

    const isCheckedIn = status === AppointmentStatus.CHECKED_IN ||
                        status === AppointmentStatus.IN_PROGRESS ||
                        status === AppointmentStatus.COMPLETED
    const checkedInAt = isCheckedIn ? new Date(appointmentTime.getTime() - 15 * 60000) : null

    try {
      const appointment = await prisma.appointment.create({
        data: {
          id: `appt-new-${Date.now()}-${i}`,
          patientId: patient.id,
          providerId: provider.id,
          appointmentTypeId: type.id,
          locationId: location.id,
          scheduledStart: appointmentTime,
          scheduledEnd: endTime,
          status: status,
          chiefComplaint: chiefComplaints[i % chiefComplaints.length],
          isNewPatient: i % 5 === 0, // Every 5th patient is new
          checkedInAt: checkedInAt,
        },
      })
      console.log(`Created appointment ${i + 1}: ${patient.firstName} ${patient.lastName} at ${appointmentTime.toLocaleTimeString()} - ${status}`)
    } catch (error) {
      console.error(`Failed to create appointment ${i + 1}:`, error)
    }
  }

  console.log(`\nSuccessfully created ${appointmentsToCreate} appointments for today!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
