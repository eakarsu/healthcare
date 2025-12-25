// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  role: UserRole;
  practiceId?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'PATIENT' | 'PROVIDER' | 'NURSE' | 'RECEPTIONIST' | 'BILLER' | 'MANAGER' | 'ADMIN';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  acceptTerms: boolean;
}

export interface TwoFactorRequest {
  code: string;
  twoFactorToken: string;
  trustDevice?: boolean;
}

// ============================================
// Patient Types
// ============================================

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  email?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  insurances: PatientInsurance[];
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

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

// ============================================
// Appointment Types
// ============================================

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
  allowOnlineBooking: boolean;
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
  bio?: string;
}

export interface Location {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  fax?: string;
  timezone?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  providerId: string;
  locationId: string;
  duration: number;
}

// ============================================
// Clinical Types
// ============================================

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity: AllergySeverity;
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED';
  onsetDate?: string;
  notes?: string;
}

export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  status: MedicationStatus;
  prescribedBy?: string;
  pharmacy?: string;
  refillsRemaining?: number;
  instructions?: string;
}

export type MedicationStatus = 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED' | 'ON_HOLD';

export interface Condition {
  id: string;
  code: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INACTIVE';
  onsetDate?: string;
  resolvedDate?: string;
  notes?: string;
}

export interface Vitals {
  id?: string;
  date?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: 'F' | 'C';
  respiratoryRate?: number;
  oxygenSaturation?: number;
  height?: number;
  heightUnit?: 'in' | 'cm';
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  bmi?: number;
  painLevel?: number;
}

export interface LabResult {
  id: string;
  orderId: string;
  testName: string;
  testCode?: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  collectedAt: string;
  resultedAt: string;
  notes?: string;
}

export interface Immunization {
  id: string;
  vaccineName: string;
  vaccineCode?: string;
  dateAdministered: string;
  lotNumber?: string;
  manufacturer?: string;
  site?: string;
  route?: string;
  doseNumber?: number;
  seriesComplete?: boolean;
}

// ============================================
// Insurance Types
// ============================================

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

// ============================================
// Messaging Types
// ============================================

export interface MessageThread {
  id: string;
  subject: string;
  participants: ThreadParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'PATIENT' | 'PROVIDER' | 'STAFF';
  senderAvatar?: string;
  body: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
  createdAt: string;
}

export interface ThreadParticipant {
  id: string;
  name: string;
  role: 'PATIENT' | 'PROVIDER' | 'STAFF';
  avatarUrl?: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

// ============================================
// Payment Types
// ============================================

export interface PatientBalance {
  currentBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  pastDue30: number;
  pastDue60: number;
  pastDue90: number;
  pastDue120Plus: number;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'ACH' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CASH' | 'CHECK';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'VOID';

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

export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault: boolean;
}

// ============================================
// Notification Types
// ============================================

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
  | 'DOCUMENT_AVAILABLE'
  | 'GENERAL';

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
