// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  role: 'PATIENT' | 'PROVIDER' | 'NURSE' | 'RECEPTIONIST' | 'BILLER' | 'MANAGER' | 'ADMIN';
  practiceId?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  email?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  insurances: PatientInsurance[];
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  provider: Provider;
  locationId: string;
  location: Location;
  appointmentType: AppointmentType;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  telehealth: boolean;
  telehealthUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  color: string;
  description?: string;
}

export interface Provider {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  credentials?: string;
  specialty?: string;
  npi?: string;
  avatarUrl?: string;
}

export interface Location {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  fax?: string;
}

// Clinical Types
export interface Encounter {
  id: string;
  patientId: string;
  appointmentId?: string;
  providerId: string;
  provider: Provider;
  encounterDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'SIGNED' | 'AMENDED';
  chiefComplaint?: string;
  vitals?: Vitals;
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  notes?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  painLevel?: number;
}

export interface Diagnosis {
  id: string;
  code: string;
  description: string;
  isPrimary: boolean;
}

export interface Procedure {
  id: string;
  code: string;
  description: string;
  quantity: number;
  modifiers?: string[];
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED';
  onsetDate?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED' | 'ON_HOLD';
  prescribedBy?: string;
}

export interface Condition {
  id: string;
  code: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INACTIVE';
  onsetDate?: string;
  resolvedDate?: string;
}

export interface LabResult {
  id: string;
  orderId: string;
  testName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  collectedAt: string;
  resultedAt: string;
}

// Insurance Types
export interface PatientInsurance {
  id: string;
  priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  planName: string;
  payerId: string;
  payerName: string;
  memberId: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDob: string;
  relationshipToSubscriber: string;
  effectiveDate: string;
  terminationDate?: string;
  copay?: number;
  deductible?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

// Messaging Types
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'PATIENT' | 'PROVIDER' | 'STAFF';
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  isRead: boolean;
  attachments?: Attachment[];
  createdAt: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: ThreadParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  id: string;
  name: string;
  role: 'PATIENT' | 'PROVIDER' | 'STAFF';
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

// Payment Types
export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'ACH' | 'CASH' | 'CHECK';
  description?: string;
  encounterId?: string;
  createdAt: string;
}

export interface PatientBalance {
  id: string;
  patientId: string;
  currentBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  pastDue30: number;
  pastDue60: number;
  pastDue90: number;
  pastDue120Plus: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  serviceDate: string;
  description: string;
  cptCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  insurancePaid?: number;
  patientResponsibility: number;
}

// Document Types
export interface Document {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  category: DocumentCategory;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export type DocumentCategory =
  | 'LAB_RESULT'
  | 'IMAGING'
  | 'CONSENT'
  | 'INSURANCE_CARD'
  | 'ID_DOCUMENT'
  | 'REFERRAL'
  | 'MEDICAL_RECORD'
  | 'OTHER';

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'MESSAGE_RECEIVED'
  | 'LAB_RESULT_READY'
  | 'PAYMENT_DUE'
  | 'PRESCRIPTION_READY'
  | 'GENERAL';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
}

export interface TwoFactorVerification {
  code: string;
  trustDevice?: boolean;
}

export interface AppointmentBookingRequest {
  providerId: string;
  locationId: string;
  appointmentTypeId: string;
  date: string;
  time: string;
  reason?: string;
}

export interface PaymentRequest {
  amount: number;
  paymentMethodId: string;
  invoiceId?: string;
  description?: string;
}
