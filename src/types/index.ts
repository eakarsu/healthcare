// Re-export Prisma types
export type {
  Practice,
  Location,
  Room,
  User,
  Provider,
  Patient,
  PatientInsurance,
  Allergy,
  Medication,
  Condition,
  FamilyHistory,
  PatientConsent,
  PatientCommunication,
  Appointment,
  AppointmentType,
  Recall,
  Encounter,
  EncounterDiagnosis,
  EncounterProcedure,
  Order,
  Service,
  FeeSchedule,
  FeeScheduleItem,
  InsurancePlan,
  Claim,
  ClaimLine,
  ClaimPayment,
  PatientPayment,
  PatientBalance,
  PatientDocument,
  BAAgreement,
  AuditLog,
  ICD10Code,
  CPTCode,
} from '@prisma/client'

// Enum types
export {
  Specialty,
  UserRole,
  PatientStatus,
  Gender,
  Severity,
  ConsentType,
  CommunicationType,
  AppointmentStatus,
  EncounterStatus,
  OrderType,
  ClaimStatus,
  PaymentMethod,
  DocumentType,
} from '@prisma/client'

// Extended types for API responses
export interface PatientWithRelations {
  id: string
  mrn: string
  firstName: string
  lastName: string
  middleName?: string | null
  preferredName?: string | null
  dateOfBirth: Date
  gender: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  status: string
  insurances?: PatientInsuranceWithPlan[]
  allergies?: AllergyType[]
  medications?: MedicationType[]
  conditions?: ConditionType[]
}

export interface PatientInsuranceWithPlan {
  id: string
  priority: number
  relationship: string
  subscriberName: string
  subscriberId: string
  groupNumber?: string | null
  isVerified: boolean
  copay?: number | null
  deductible?: number | null
  insurancePlan: {
    id: string
    name: string
    payerName: string
    planType?: string | null
  }
}

export interface AllergyType {
  id: string
  allergen: string
  reaction?: string | null
  severity: string
  status: string
}

export interface MedicationType {
  id: string
  name: string
  dosage?: string | null
  frequency?: string | null
  status: string
}

export interface ConditionType {
  id: string
  icdCode?: string | null
  name: string
  status: string
}

export interface AppointmentWithRelations {
  id: string
  scheduledStart: Date
  scheduledEnd: Date
  status: string
  chiefComplaint?: string | null
  notes?: string | null
  isNewPatient: boolean
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    phone?: string | null
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
    title?: string | null
    color?: string | null
  }
  type: {
    id: string
    name: string
    duration: number
    color?: string | null
  }
  location: {
    id: string
    name: string
  }
  room?: {
    id: string
    name: string
  } | null
}

export interface EncounterWithRelations {
  id: string
  encounterNumber: string
  type: string
  status: string
  encounterDate: Date
  chiefComplaint?: string | null
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
  signedAt?: Date | null
  signedBy?: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
    title?: string | null
  }
  diagnoses: Array<{
    id: string
    sequence: number
    icdCode: string
    description: string
  }>
  procedures: Array<{
    id: string
    cptCode: string
    description: string
    quantity: number
    modifiers: string[]
  }>
}

export interface ClaimWithRelations {
  id: string
  claimNumber: string
  status: string
  serviceDate: Date
  submittedDate?: Date | null
  totalCharges: number
  paidAmount?: number | null
  patientResponsibility?: number | null
  denialReason?: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  }
  insurance: {
    id: string
    subscriberId: string
    insurancePlan: {
      name: string
      payerName: string
    }
  }
  lines: Array<{
    id: string
    lineNumber: number
    cptCode: string
    description: string
    chargeAmount: number
    paidAmount?: number | null
  }>
}

// Form types
export interface PatientFormData {
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  dateOfBirth: string
  gender: string
  ssn?: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  preferredContact?: string
  preferredLanguage?: string
  emergencyName?: string
  emergencyPhone?: string
  emergencyRelation?: string
  referralSource?: string
  referredBy?: string
}

export interface AppointmentFormData {
  patientId: string
  providerId: string
  locationId: string
  roomId?: string
  appointmentTypeId: string
  scheduledStart: string
  chiefComplaint?: string
  notes?: string
  isNewPatient?: boolean
}

export interface EncounterFormData {
  appointmentId?: string
  patientId: string
  providerId: string
  type: string
  chiefComplaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  painLevel?: number
  height?: number
  weight?: number
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  details?: string
}
