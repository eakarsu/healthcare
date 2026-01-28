import { prisma } from '@/lib/prisma'

export interface SuperbillData {
  // Practice info
  practice: {
    name: string
    npi: string
    taxId: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    fax?: string
  }

  // Provider info
  provider: {
    name: string
    npi: string
    specialty: string
    credentials: string[]
  }

  // Patient info
  patient: {
    name: string
    dateOfBirth: string
    address: string
    phone: string
    memberId?: string
    groupNumber?: string
  }

  // Insurance info
  insurance?: {
    planName: string
    payerName: string
    memberId: string
    groupNumber?: string
    subscriberName?: string
  }

  // Visit info
  visit: {
    date: string
    arrivalTime?: string
    placeOfService: string
    placeOfServiceCode: string
  }

  // Diagnoses
  diagnoses: Array<{
    code: string
    description: string
    sequence: number
  }>

  // Procedures/services
  procedures: Array<{
    cptCode: string
    description: string
    modifiers: string[]
    quantity: number
    unitCharge: number
    totalCharge: number
    diagnosisPointers: number[]
  }>

  // Financial summary
  summary: {
    totalCharges: number
    insuranceEstimate: number
    patientEstimate: number
    amountPaid: number
    amountDue: number
    copay?: number
    deductible?: number
    coinsurance?: number
  }

  // Superbill metadata
  superbillNumber: string
  createdAt: string
}

/**
 * Generate superbill data from an encounter
 */
export async function generateSuperbillData(encounterId: string): Promise<SuperbillData> {
  const encounter = await prisma.encounter.findUnique({
    where: { id: encounterId },
    include: {
      patient: {
        include: {
          insurances: {
            where: { priority: 1 },
            include: { insurancePlan: true },
          },
        },
      },
      provider: {
        include: {
          user: true,
          practice: true,
        },
      },
      diagnoses: {
        orderBy: { sequence: 'asc' },
      },
      procedures: {
        include: { service: true },
      },
      appointment: true,
    },
  })

  if (!encounter) {
    throw new Error('Encounter not found')
  }

  const practice = encounter.provider.practice
  const patient = encounter.patient
  const provider = encounter.provider
  const primaryInsurance = patient.insurances[0]

  // Calculate charges (fees would come from fee schedule in production)
  const defaultCharge = 100 // Default charge per procedure
  const totalCharges = encounter.procedures.reduce(
    (sum: number, proc) => sum + defaultCharge * (proc.quantity || 1),
    0
  )

  // Estimate patient responsibility (simplified)
  const copay = primaryInsurance ? 25 : 0 // Default copay
  const insuranceEstimate = primaryInsurance ? totalCharges * 0.8 : 0
  const patientEstimate = totalCharges - insuranceEstimate

  // Generate superbill number
  const superbillNumber = `SB-${Date.now().toString(36).toUpperCase()}`

  const superbillData: SuperbillData = {
    practice: {
      name: practice.name,
      npi: practice.npi || '',
      taxId: practice.taxId || '',
      address: practice.address || '',
      city: practice.city || '',
      state: practice.state || '',
      zip: practice.zip || '',
      phone: practice.phone || '',
      fax: practice.fax || undefined,
    },
    provider: {
      name: `${provider.user.firstName} ${provider.user.lastName}`,
      npi: provider.npi || '',
      specialty: provider.specialty,
      credentials: provider.credentials || [],
    },
    patient: {
      name: `${patient.firstName} ${patient.lastName}`,
      dateOfBirth: patient.dateOfBirth.toLocaleDateString('en-US'),
      address: formatAddress(patient.address, patient.city, patient.state, patient.zip),
      phone: patient.phone || '',
      memberId: primaryInsurance?.subscriberId,
      groupNumber: primaryInsurance?.groupNumber || undefined,
    },
    insurance: primaryInsurance
      ? {
          planName: primaryInsurance.insurancePlan.name,
          payerName: primaryInsurance.insurancePlan.payerName,
          memberId: primaryInsurance.subscriberId,
          groupNumber: primaryInsurance.groupNumber || undefined,
          subscriberName: primaryInsurance.subscriberName || undefined,
        }
      : undefined,
    visit: {
      date: encounter.encounterDate.toLocaleDateString('en-US'),
      arrivalTime: encounter.appointment?.checkedInAt?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      placeOfService: getPlaceOfServiceName('11'), // Default office visit
      placeOfServiceCode: '11',
    },
    diagnoses: encounter.diagnoses.map((d) => ({
      code: d.icdCode,
      description: d.description || '',
      sequence: d.sequence,
    })),
    procedures: encounter.procedures.map((p) => ({
      cptCode: p.cptCode,
      description: p.description || '',
      modifiers: p.modifiers || [],
      quantity: p.quantity || 1,
      unitCharge: defaultCharge,
      totalCharge: defaultCharge * (p.quantity || 1),
      diagnosisPointers: [1], // Default to first diagnosis
    })),
    summary: {
      totalCharges,
      insuranceEstimate,
      patientEstimate,
      amountPaid: 0,
      amountDue: patientEstimate,
      copay,
    },
    superbillNumber,
    createdAt: new Date().toISOString(),
  }

  return superbillData
}

/**
 * Save superbill to database
 */
export async function saveSuperbill(
  encounterId: string,
  patientId: string,
  providerId: string,
  data: SuperbillData
) {
  const superbill = await prisma.superbill.create({
    data: {
      superbillNumber: data.superbillNumber,
      encounterId,
      patientId,
      providerId,
      serviceDate: new Date(data.visit.date),
      diagnoses: data.diagnoses,
      procedures: data.procedures,
      totalCharges: data.summary.totalCharges,
      patientEstimate: data.summary.patientEstimate,
      amountPaid: data.summary.amountPaid,
    },
  })

  return superbill
}

/**
 * Format address components into a single string
 */
function formatAddress(
  address?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null
): string {
  const parts = [address, city, state].filter(Boolean)
  let formatted = parts.join(', ')
  if (zip) formatted += ` ${zip}`
  return formatted
}

/**
 * Get human-readable place of service name
 */
function getPlaceOfServiceName(code: string): string {
  const places: Record<string, string> = {
    '11': 'Office',
    '12': 'Home',
    '21': 'Inpatient Hospital',
    '22': 'Outpatient Hospital',
    '23': 'Emergency Room - Hospital',
    '24': 'Ambulatory Surgical Center',
    '31': 'Skilled Nursing Facility',
    '32': 'Nursing Facility',
    '41': 'Ambulance - Land',
    '42': 'Ambulance - Air or Water',
    '81': 'Independent Laboratory',
    '99': 'Other',
  }
  return places[code] || 'Office'
}
