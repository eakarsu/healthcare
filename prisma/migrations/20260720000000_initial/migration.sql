-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('DENTAL', 'PHYSICAL_THERAPY', 'CHIROPRACTIC', 'URGENT_CARE', 'PRIMARY_CARE', 'DERMATOLOGY', 'ORTHOPEDIC', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROVIDER', 'NURSE', 'RECEPTIONIST', 'BILLER', 'MANAGER');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('HIPAA_NOTICE', 'TREATMENT_CONSENT', 'FINANCIAL_RESPONSIBILITY', 'TELEHEALTH_CONSENT', 'RELEASE_OF_INFORMATION', 'PHOTOGRAPHY_CONSENT');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'SMS', 'PHONE', 'PORTAL_MESSAGE', 'LETTER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('IN_PROGRESS', 'PENDING_REVIEW', 'SIGNED', 'LOCKED', 'AMENDED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LAB', 'IMAGING', 'REFERRAL', 'PRESCRIPTION', 'DME', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('CREATED', 'VALIDATED', 'SUBMITTED', 'ACKNOWLEDGED', 'PENDING', 'PAID', 'PARTIAL', 'DENIED', 'APPEALED', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'ACH', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INTAKE_FORM', 'CONSENT', 'INSURANCE_CARD', 'ID', 'LAB_RESULT', 'IMAGING', 'REFERRAL', 'CORRESPONDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "AmbientSessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PriorAuthStatus" AS ENUM ('PENDING', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'DENIED', 'APPEALED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'READY_TO_SEND', 'SENT', 'RECEIVED', 'FILLED', 'PARTIAL_FILL', 'CANCELLED', 'EXPIRED', 'DENIED');

-- CreateEnum
CREATE TYPE "ImagingStudyStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'REPORTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScreeningType" AS ENUM ('PHQ9', 'GAD7', 'PHQ2', 'GAD2', 'AUDIT_C', 'DAST_10', 'PCL5', 'MDQ', 'CSSRS', 'EDINBURGH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "IntakeFormType" AS ENUM ('DEMOGRAPHICS', 'MEDICAL_HISTORY', 'MEDICATIONS', 'ALLERGIES', 'FAMILY_HISTORY', 'SOCIAL_HISTORY', 'REVIEW_OF_SYSTEMS', 'CONSENT', 'INSURANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('CONFIRMATION', 'REMINDER_24H', 'REMINDER_2H', 'FOLLOWUP', 'RECALL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('PENDING', 'SPECIMEN_COLLECTED', 'SENT_TO_LAB', 'IN_PROGRESS', 'RESULTS_RECEIVED', 'REVIEWED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "npi" TEXT,
    "taxId" TEXT,
    "specialty" "Specialty" NOT NULL,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "operatingHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "npi" TEXT,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "specialty" TEXT NOT NULL,
    "title" TEXT,
    "color" TEXT,
    "credentials" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderLocation" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "ProviderLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSchedule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "ProviderSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "ssn" TEXT,
    "preferredName" TEXT,
    "pronouns" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "preferredContact" TEXT DEFAULT 'phone',
    "preferredLanguage" TEXT DEFAULT 'en',
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "employer" TEXT,
    "occupation" TEXT,
    "referralSource" TEXT,
    "referredBy" TEXT,
    "bloodType" TEXT,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "portalEmail" TEXT,
    "portalPassword" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientInsurance" (
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "relationship" TEXT NOT NULL,
    "subscriberName" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "groupNumber" TEXT,
    "insurancePlanId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDate" TIMESTAMP(3),
    "eligibilityData" JSONB,
    "effectiveDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "copay" DECIMAL(10,2),
    "deductible" DECIMAL(10,2),
    "deductibleMet" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MODERATE',
    "status" TEXT NOT NULL DEFAULT 'active',
    "onsetDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "prescribedBy" TEXT,
    "prescribedDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "icdCode" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "onsetDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyHistory" (
    "id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "ageAtOnset" INTEGER,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "FamilyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientConsent" (
    "id" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'signed',
    "signedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresDate" TIMESTAMP(3),
    "signatureFile" TEXT,
    "ipAddress" TEXT,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientCommunication" (
    "id" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "appointmentTypeId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "chiefComplaint" TEXT,
    "notes" TEXT,
    "isNewPatient" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "roomId" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "duration" INTEGER NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prepTime" INTEGER NOT NULL DEFAULT 0,
    "cleanupTime" INTEGER NOT NULL DEFAULT 0,
    "allowOnline" BOOLEAN NOT NULL DEFAULT true,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DECIMAL(10,2),

    CONSTRAINT "AppointmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recall" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "Recall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "preferredDays" TEXT[],
    "preferredTimeStart" TEXT,
    "preferredTimeEnd" TEXT,
    "contactedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT,
    "appointmentTypeId" TEXT NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "encounterNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "encounterDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DECIMAL(4,1),
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "painLevel" INTEGER,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "chiefComplaint" TEXT,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "reviewOfSystems" JSONB,
    "signedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "coSignedBy" TEXT,
    "coSignedAt" TIMESTAMP(3),
    "audioRecordingUrl" TEXT,
    "transcription" TEXT,
    "aiDraftNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT,
    "providerId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterDiagnosis" (
    "id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "icdCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "encounterId" TEXT NOT NULL,

    CONSTRAINT "EncounterDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterProcedure" (
    "id" TEXT NOT NULL,
    "cptCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "modifiers" TEXT[],
    "toothNumber" TEXT,
    "surface" TEXT,
    "units" DECIMAL(5,2),
    "notes" TEXT,
    "encounterId" TEXT NOT NULL,
    "serviceId" TEXT,

    CONSTRAINT "EncounterProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'routine',
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "encounterId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelehealthSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "duration" INTEGER,
    "platform" TEXT NOT NULL DEFAULT 'INTERNAL',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "passcode" TEXT,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "patientJoinedAt" TIMESTAMP(3),
    "providerJoinedAt" TIMESTAMP(3),
    "connectionQuality" TEXT,
    "technicalIssues" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT NOT NULL,

    CONSTRAINT "TelehealthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "FeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeScheduleItem" (
    "id" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "feeScheduleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "FeeScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payerId" TEXT,
    "payerName" TEXT NOT NULL,
    "planType" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "electronicPayerId" TEXT,
    "submissionMethod" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'CREATED',
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "submittedDate" TIMESTAMP(3),
    "processedDate" TIMESTAMP(3),
    "totalCharges" DECIMAL(10,2) NOT NULL,
    "allowedAmount" DECIMAL(10,2),
    "paidAmount" DECIMAL(10,2),
    "adjustmentAmount" DECIMAL(10,2),
    "patientResponsibility" DECIMAL(10,2),
    "placeOfService" TEXT,
    "clearinghouseId" TEXT,
    "ediFileId" TEXT,
    "eraReceived" BOOLEAN NOT NULL DEFAULT false,
    "eraDate" TIMESTAMP(3),
    "denialReason" TEXT,
    "denialCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT,
    "insuranceId" TEXT NOT NULL,
    "insurancePlanId" TEXT NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimLine" (
    "id" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "cptCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "modifiers" TEXT[],
    "units" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "diagnosisPointers" INTEGER[],
    "chargeAmount" DECIMAL(10,2) NOT NULL,
    "allowedAmount" DECIMAL(10,2),
    "paidAmount" DECIMAL(10,2),
    "adjustmentAmount" DECIMAL(10,2),
    "denialReason" TEXT,
    "remarkCodes" TEXT[],
    "claimId" TEXT NOT NULL,
    "procedureId" TEXT,

    CONSTRAINT "ClaimLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimPayment" (
    "id" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "checkNumber" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "payerType" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimId" TEXT NOT NULL,

    CONSTRAINT "ClaimPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPayment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeRefundId" TEXT,
    "status" TEXT DEFAULT 'completed',
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientBalance" (
    "id" TEXT NOT NULL,
    "totalCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "insurancePaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "patientPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "adjustments" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "category" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BAAgreement" (
    "id" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorType" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "documentPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "BAAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "patientId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "phiAccessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ICD10Code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ICD10Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPTCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "workRVU" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CPTCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbientSession" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "AmbientSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "audioChunks" JSONB[],
    "liveTranscript" TEXT,
    "speakerSegments" JSONB[],
    "draftSoapNote" JSONB,
    "suggestedCodes" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbientSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorAuthorization" (
    "id" TEXT NOT NULL,
    "authNumber" TEXT,
    "status" "PriorAuthStatus" NOT NULL DEFAULT 'PENDING',
    "urgency" TEXT NOT NULL DEFAULT 'STANDARD',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "serviceType" TEXT NOT NULL,
    "procedureCodes" TEXT[],
    "diagnosisCodes" TEXT[],
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "clinicalNotes" TEXT,
    "supportingDocs" TEXT[],
    "approvedUnits" INTEGER,
    "denialReason" TEXT,
    "appealDeadline" TIMESTAMP(3),
    "submissionMethod" TEXT,
    "submittedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submissionLog" JSONB[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,
    "encounterId" TEXT,

    CONSTRAINT "PriorAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayerAuthRules" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "authCriteria" JSONB,
    "typicalDuration" INTEGER,
    "submissionUrl" TEXT,
    "submissionFax" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayerAuthRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineBookingSettings" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "minLeadTimeHours" INTEGER NOT NULL DEFAULT 24,
    "maxLeadTimeDays" INTEGER NOT NULL DEFAULT 60,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "allowNewPatients" BOOLEAN NOT NULL DEFAULT true,
    "newPatientFormUrl" TEXT,
    "sendConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "sendReminder24h" BOOLEAN NOT NULL DEFAULT true,
    "sendReminder2h" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessage" TEXT,
    "confirmationMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineBookingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineBooking" (
    "id" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "patientId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "isNewPatient" BOOLEAN NOT NULL DEFAULT false,
    "appointmentTypeId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "insuranceInfo" JSONB,
    "confirmedAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder2hSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FHIRConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "baseUrl" TEXT NOT NULL,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "accessToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "resources" TEXT[],
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER,
    "lastSyncAt" TIMESTAMP(3),
    "fhirVersion" TEXT NOT NULL DEFAULT 'R4',
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "FHIRConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FHIRSyncLog" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestData" JSONB,
    "responseData" JSONB,
    "errorMessage" TEXT,
    "externalEventId" TEXT,
    "payloadHash" TEXT,
    "provenance" JSONB,
    "reviewStatus" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FHIRSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FHIRResourceMapping" (
    "id" TEXT NOT NULL,
    "localResource" TEXT NOT NULL,
    "localField" TEXT NOT NULL,
    "fhirResource" TEXT NOT NULL,
    "fhirPath" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "transformation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FHIRResourceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "rxNumber" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "drugName" TEXT NOT NULL,
    "drugCode" TEXT,
    "strength" TEXT,
    "form" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT 'Oral',
    "duration" TEXT,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'tablets',
    "refills" INTEGER NOT NULL DEFAULT 0,
    "dispenseAsWritten" BOOLEAN NOT NULL DEFAULT false,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleClass" TEXT,
    "deaNumber" TEXT,
    "epcsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "epcsSigned" BOOLEAN NOT NULL DEFAULT false,
    "epcsSignedAt" TIMESTAMP(3),
    "epcsSignature" TEXT,
    "pharmacyId" TEXT,
    "pharmacyNpi" TEXT,
    "pharmacyName" TEXT,
    "pharmacyAddress" TEXT,
    "pharmacyPhone" TEXT,
    "pharmacyFax" TEXT,
    "transmissionMethod" TEXT,
    "transmittedAt" TIMESTAMP(3),
    "transmissionRef" TEXT,
    "transmissionStatus" TEXT,
    "indication" TEXT,
    "notes" TEXT,
    "writtenDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionRenewal" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestSource" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "newRxId" TEXT,
    "prescriptionId" TEXT NOT NULL,

    CONSTRAINT "PrescriptionRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionFill" (
    "id" TEXT NOT NULL,
    "fillNumber" INTEGER NOT NULL,
    "fillDate" TIMESTAMP(3) NOT NULL,
    "quantityFilled" INTEGER NOT NULL,
    "daysSupply" INTEGER,
    "pharmacyNpi" TEXT,
    "prescriptionId" TEXT NOT NULL,

    CONSTRAINT "PrescriptionFill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
    "npi" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ncpdpId" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fax" TEXT,
    "acceptsEpcs" BOOLEAN NOT NULL DEFAULT false,
    "acceptsNewRx" BOOLEAN NOT NULL DEFAULT true,
    "acceptsRefill" BOOLEAN NOT NULL DEFAULT true,
    "accepts24Hour" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugDatabase" (
    "id" TEXT NOT NULL,
    "ndcCode" TEXT NOT NULL,
    "rxNormCode" TEXT,
    "brandName" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "route" TEXT,
    "manufacturer" TEXT,
    "therapeuticClass" TEXT,
    "pharmacologicClass" TEXT,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleClass" TEXT,
    "interactions" JSONB,
    "isFormulary" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugDatabase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingStudy" (
    "id" TEXT NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "status" "ImagingStudyStatus" NOT NULL DEFAULT 'SCHEDULED',
    "modality" TEXT NOT NULL,
    "bodyPart" TEXT,
    "studyDescription" TEXT,
    "studyInstanceUid" TEXT,
    "seriesCount" INTEGER NOT NULL DEFAULT 0,
    "instanceCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledDate" TIMESTAMP(3),
    "performedDate" TIMESTAMP(3),
    "findings" TEXT,
    "impression" TEXT,
    "reportedBy" TEXT,
    "reportedAt" TIMESTAMP(3),
    "aiAnalysis" JSONB,
    "aiConfidence" DECIMAL(5,2),
    "storageLocation" TEXT,
    "thumbnailUrl" TEXT,
    "orderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT,

    CONSTRAINT "ImagingStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingSeries" (
    "id" TEXT NOT NULL,
    "seriesInstanceUid" TEXT NOT NULL,
    "seriesNumber" INTEGER NOT NULL,
    "modality" TEXT NOT NULL,
    "description" TEXT,
    "bodyPart" TEXT,
    "instanceCount" INTEGER NOT NULL DEFAULT 0,
    "studyId" TEXT NOT NULL,

    CONSTRAINT "ImagingSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingInstance" (
    "id" TEXT NOT NULL,
    "sopInstanceUid" TEXT NOT NULL,
    "instanceNumber" INTEGER NOT NULL,
    "rows" INTEGER,
    "columns" INTEGER,
    "bitsAllocated" INTEGER,
    "photometricInterpretation" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "seriesId" TEXT NOT NULL,

    CONSTRAINT "ImagingInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentalHealthScreening" (
    "id" TEXT NOT NULL,
    "type" "ScreeningType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "responses" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "interpretation" TEXT,
    "riskLevel" TEXT,
    "providerNotes" TEXT,
    "followUpPlan" TEXT,
    "referralMade" BOOLEAN NOT NULL DEFAULT false,
    "referralTo" TEXT,
    "administeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "providerId" TEXT,

    CONSTRAINT "MentalHealthScreening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningTemplate" (
    "id" TEXT NOT NULL,
    "type" "ScreeningType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "scoringGuide" JSONB,
    "mildThreshold" INTEGER,
    "moderateThreshold" INTEGER,
    "severeThreshold" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreeningTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IntakeFormType" NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "expirationDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "practiceId" TEXT NOT NULL,

    CONSTRAINT "IntakeForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeFormSubmission" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responses" JSONB NOT NULL,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "importedToChart" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formId" TEXT NOT NULL,
    "patientId" TEXT,
    "appointmentId" TEXT,

    CONSTRAINT "IntakeFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReminder" (
    "id" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT NOT NULL,
    "message" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveryStatus" TEXT,
    "errorMessage" TEXT,
    "responseReceived" BOOLEAN NOT NULL DEFAULT false,
    "responseType" TEXT,
    "responseAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT NOT NULL,

    CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotConversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "patientId" TEXT,
    "intent" TEXT,
    "messages" JSONB[],
    "context" JSONB,
    "handedOffToHuman" BOOLEAN NOT NULL DEFAULT false,
    "handoffReason" TEXT,
    "handoffAt" TIMESTAMP(3),
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedSuccessfully" BOOLEAN,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingSuggestion" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "triggerText" TEXT NOT NULL,
    "triggerPosition" INTEGER,
    "codeType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DECIMAL(5,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUGGESTED',
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodingSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingAuditRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cptCodes" TEXT[],
    "icdCodes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingAuditRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedDocument" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "encryptedPath" TEXT,
    "encryptionKeyId" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "fileContent" BYTEA,
    "category" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "patientId" TEXT,
    "encounterId" TEXT,
    "claimId" TEXT,
    "faxMessageId" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'PROVIDER',
    "retentionDate" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "EncryptedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderedBy" TEXT NOT NULL,
    "labName" TEXT,
    "labPhone" TEXT,
    "labFax" TEXT,
    "specimenType" TEXT,
    "specimenCollectedAt" TIMESTAMP(3),
    "specimenSentAt" TIMESTAMP(3),
    "testCodes" TEXT[],
    "testDescriptions" TEXT[],
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "expectedResultsAt" TIMESTAMP(3),
    "resultsReceivedAt" TIMESTAMP(3),
    "resultsDocumentId" TEXT,
    "icdCodes" TEXT[],
    "clinicalNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "patientNotified" BOOLEAN NOT NULL DEFAULT false,
    "patientNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "status" "LabOrderStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "LabOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimSubmission" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "submissionType" TEXT NOT NULL,
    "transactionId" TEXT,
    "edi837Content" TEXT,
    "edi837FileName" TEXT,
    "submittedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "clearinghouseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "responseCode" TEXT,
    "responseMessage" TEXT,
    "era835Content" TEXT,
    "era835ReceivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityCheck" (
    "id" TEXT NOT NULL,
    "patientInsuranceId" TEXT NOT NULL,
    "transactionId" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceTypeCodes" TEXT[],
    "edi270Content" TEXT,
    "edi271Content" TEXT,
    "eligibilityStatus" TEXT NOT NULL,
    "coverageDetails" JSONB,
    "copayInfo" JSONB,
    "deductibleInfo" JSONB,
    "outOfPocketInfo" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrFirstTransaction" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "transactionId" TEXT,
    "ncpdpScriptVersion" TEXT,
    "messageContent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "responseCode" TEXT,
    "responseMessage" TEXT,
    "pharmacyResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrFirstTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderEPCS" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "identityProofedAt" TIMESTAMP(3),
    "identityProofMethod" TEXT,
    "deaNumber" TEXT,
    "deaExpirationDate" TIMESTAMP(3),
    "deaSchedules" TEXT[],
    "epcsTokenSerial" TEXT,
    "epcsTokenActivatedAt" TIMESTAMP(3),
    "epcsActivatedAt" TIMESTAMP(3),
    "epcsDeactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderEPCS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaxMessage" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "twilioSid" TEXT,
    "twilioMediaUrl" TEXT,
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "numPages" INTEGER,
    "quality" TEXT,
    "documentPath" TEXT,
    "patientId" TEXT,
    "encounterId" TEXT,
    "prescriptionId" TEXT,
    "priorAuthId" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "category" TEXT,
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "appointmentId" TEXT,
    "patientId" TEXT,
    "verificationMethod" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "demographicsUpdated" BOOLEAN NOT NULL DEFAULT false,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "consentsSigned" BOOLEAN NOT NULL DEFAULT false,
    "formsCompleted" TEXT[],
    "copayCollected" DECIMAL(10,2),
    "paymentMethod" TEXT,
    "paymentTransactionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "deviceId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KioskSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskDevice" (
    "id" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "enablePayments" BOOLEAN NOT NULL DEFAULT true,
    "enableInsuranceCapture" BOOLEAN NOT NULL DEFAULT true,
    "enableFormSigning" BOOLEAN NOT NULL DEFAULT true,
    "lastHeartbeat" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KioskDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Superbill" (
    "id" TEXT NOT NULL,
    "superbillNumber" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "diagnoses" JSONB NOT NULL,
    "procedures" JSONB NOT NULL,
    "totalCharges" DECIMAL(10,2) NOT NULL,
    "insuranceEstimate" DECIMAL(10,2),
    "patientEstimate" DECIMAL(10,2),
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentCollected" DECIMAL(10,2),
    "paymentMethod" TEXT,
    "paymentTransactionId" TEXT,
    "pdfPath" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "printedAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),
    "emailedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Superbill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityMeasure" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "measureTitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "domain" TEXT,
    "description" TEXT,
    "numeratorDescription" TEXT,
    "denominatorDescription" TEXT,
    "exclusionCriteria" TEXT,
    "highPriority" BOOLEAN NOT NULL DEFAULT false,
    "outcomeOrPatientExp" BOOLEAN NOT NULL DEFAULT false,
    "measurePoints" INTEGER NOT NULL DEFAULT 10,
    "benchmark3Star" DECIMAL(5,2),
    "benchmark4Star" DECIMAL(5,2),
    "benchmark5Star" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientQualityMeasure" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "performanceYear" INTEGER NOT NULL,
    "performanceStart" TIMESTAMP(3) NOT NULL,
    "performanceEnd" TIMESTAMP(3) NOT NULL,
    "inDenominator" BOOLEAN NOT NULL DEFAULT false,
    "inNumerator" BOOLEAN NOT NULL DEFAULT false,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "isException" BOOLEAN NOT NULL DEFAULT false,
    "measureDate" TIMESTAMP(3),
    "measureValue" TEXT,
    "measureValueNumeric" DECIMAL(10,2),
    "encounterId" TEXT,
    "documentationNotes" TEXT,
    "autoCalculated" BOOLEAN NOT NULL DEFAULT false,
    "lastCalculatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientQualityMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MIPSSubmission" (
    "id" TEXT NOT NULL,
    "submissionYear" INTEGER NOT NULL,
    "submissionType" TEXT NOT NULL,
    "qualityScore" DECIMAL(5,2),
    "piScore" DECIMAL(5,2),
    "iaScore" DECIMAL(5,2),
    "costScore" DECIMAL(5,2),
    "finalScore" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cmsAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "cmsResponseDate" TIMESTAMP(3),
    "cmsResponseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MIPSSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResult" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "userId" TEXT,
    "practiceId" TEXT,
    "patientId" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "durationMs" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppointmentTypeToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderLocation_providerId_locationId_key" ON "ProviderLocation"("providerId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSchedule_providerId_dayOfWeek_key" ON "ProviderSchedule"("providerId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrn_key" ON "Patient"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "PatientInsurance_patientId_priority_key" ON "PatientInsurance"("patientId", "priority");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_providerId_idx" ON "Appointment"("providerId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledStart_idx" ON "Appointment"("scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_locationId_idx" ON "Appointment"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_encounterNumber_key" ON "Encounter"("encounterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_appointmentId_key" ON "Encounter"("appointmentId");

-- CreateIndex
CREATE INDEX "Encounter_patientId_idx" ON "Encounter"("patientId");

-- CreateIndex
CREATE INDEX "Encounter_providerId_idx" ON "Encounter"("providerId");

-- CreateIndex
CREATE INDEX "Encounter_encounterDate_idx" ON "Encounter"("encounterDate");

-- CreateIndex
CREATE INDEX "Encounter_status_idx" ON "Encounter"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Service_practiceId_code_key" ON "Service"("practiceId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "TelehealthSession_sessionId_key" ON "TelehealthSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TelehealthSession_appointmentId_key" ON "TelehealthSession"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeScheduleItem_feeScheduleId_serviceId_key" ON "FeeScheduleItem"("feeScheduleId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_patientId_idx" ON "Claim"("patientId");

-- CreateIndex
CREATE INDEX "Claim_providerId_idx" ON "Claim"("providerId");

-- CreateIndex
CREATE INDEX "Claim_serviceDate_idx" ON "Claim"("serviceDate");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimLine_procedureId_key" ON "ClaimLine"("procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientBalance_patientId_key" ON "PatientBalance"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_patientId_idx" ON "AuditLog"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ICD10Code_code_key" ON "ICD10Code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CPTCode_code_key" ON "CPTCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayerAuthRules_payerId_procedureCode_key" ON "PayerAuthRules"("payerId", "procedureCode");

-- CreateIndex
CREATE UNIQUE INDEX "OnlineBookingSettings_practiceId_key" ON "OnlineBookingSettings"("practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "OnlineBooking_confirmationCode_key" ON "OnlineBooking"("confirmationCode");

-- CreateIndex
CREATE INDEX "FHIRSyncLog_resourceType_resourceId_idx" ON "FHIRSyncLog"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "FHIRSyncLog_connectionId_externalEventId_key" ON "FHIRSyncLog"("connectionId", "externalEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_rxNumber_key" ON "Prescription"("rxNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_npi_key" ON "Pharmacy"("npi");

-- CreateIndex
CREATE UNIQUE INDEX "DrugDatabase_ndcCode_key" ON "DrugDatabase"("ndcCode");

-- CreateIndex
CREATE UNIQUE INDEX "ImagingStudy_accessionNumber_key" ON "ImagingStudy"("accessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ImagingStudy_studyInstanceUid_key" ON "ImagingStudy"("studyInstanceUid");

-- CreateIndex
CREATE UNIQUE INDEX "ImagingStudy_orderId_key" ON "ImagingStudy"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ImagingSeries_seriesInstanceUid_key" ON "ImagingSeries"("seriesInstanceUid");

-- CreateIndex
CREATE UNIQUE INDEX "ImagingInstance_sopInstanceUid_key" ON "ImagingInstance"("sopInstanceUid");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConversation_sessionId_key" ON "ChatbotConversation"("sessionId");

-- CreateIndex
CREATE INDEX "EncryptedDocument_patientId_idx" ON "EncryptedDocument"("patientId");

-- CreateIndex
CREATE INDEX "EncryptedDocument_category_idx" ON "EncryptedDocument"("category");

-- CreateIndex
CREATE INDEX "EncryptedDocument_createdAt_idx" ON "EncryptedDocument"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_orderNumber_key" ON "LabOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_status_idx" ON "LabOrder"("status");

-- CreateIndex
CREATE INDEX "LabOrder_orderedAt_idx" ON "LabOrder"("orderedAt");

-- CreateIndex
CREATE INDEX "LabOrderStatusHistory_labOrderId_idx" ON "LabOrderStatusHistory"("labOrderId");

-- CreateIndex
CREATE INDEX "ClaimSubmission_claimId_idx" ON "ClaimSubmission"("claimId");

-- CreateIndex
CREATE INDEX "ClaimSubmission_transactionId_idx" ON "ClaimSubmission"("transactionId");

-- CreateIndex
CREATE INDEX "EligibilityCheck_patientInsuranceId_idx" ON "EligibilityCheck"("patientInsuranceId");

-- CreateIndex
CREATE INDEX "EligibilityCheck_checkedAt_idx" ON "EligibilityCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "DrFirstTransaction_prescriptionId_idx" ON "DrFirstTransaction"("prescriptionId");

-- CreateIndex
CREATE INDEX "DrFirstTransaction_transactionId_idx" ON "DrFirstTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderEPCS_providerId_key" ON "ProviderEPCS"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "FaxMessage_twilioSid_key" ON "FaxMessage"("twilioSid");

-- CreateIndex
CREATE INDEX "FaxMessage_patientId_idx" ON "FaxMessage"("patientId");

-- CreateIndex
CREATE INDEX "FaxMessage_status_idx" ON "FaxMessage"("status");

-- CreateIndex
CREATE INDEX "FaxMessage_createdAt_idx" ON "FaxMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KioskSession_sessionToken_key" ON "KioskSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "KioskSession_appointmentId_key" ON "KioskSession"("appointmentId");

-- CreateIndex
CREATE INDEX "KioskSession_appointmentId_idx" ON "KioskSession"("appointmentId");

-- CreateIndex
CREATE INDEX "KioskSession_patientId_idx" ON "KioskSession"("patientId");

-- CreateIndex
CREATE INDEX "KioskSession_sessionToken_idx" ON "KioskSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "KioskDevice_deviceToken_key" ON "KioskDevice"("deviceToken");

-- CreateIndex
CREATE INDEX "KioskDevice_locationId_idx" ON "KioskDevice"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Superbill_superbillNumber_key" ON "Superbill"("superbillNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Superbill_encounterId_key" ON "Superbill"("encounterId");

-- CreateIndex
CREATE INDEX "Superbill_patientId_idx" ON "Superbill"("patientId");

-- CreateIndex
CREATE INDEX "Superbill_serviceDate_idx" ON "Superbill"("serviceDate");

-- CreateIndex
CREATE UNIQUE INDEX "QualityMeasure_measureId_key" ON "QualityMeasure"("measureId");

-- CreateIndex
CREATE INDEX "PatientQualityMeasure_patientId_idx" ON "PatientQualityMeasure"("patientId");

-- CreateIndex
CREATE INDEX "PatientQualityMeasure_providerId_idx" ON "PatientQualityMeasure"("providerId");

-- CreateIndex
CREATE INDEX "PatientQualityMeasure_performanceYear_idx" ON "PatientQualityMeasure"("performanceYear");

-- CreateIndex
CREATE UNIQUE INDEX "PatientQualityMeasure_measureId_patientId_performanceYear_key" ON "PatientQualityMeasure"("measureId", "patientId", "performanceYear");

-- CreateIndex
CREATE UNIQUE INDEX "MIPSSubmission_submissionYear_submissionType_key" ON "MIPSSubmission"("submissionYear", "submissionType");

-- CreateIndex
CREATE INDEX "AIResult_feature_idx" ON "AIResult"("feature");

-- CreateIndex
CREATE INDEX "AIResult_userId_idx" ON "AIResult"("userId");

-- CreateIndex
CREATE INDEX "AIResult_practiceId_idx" ON "AIResult"("practiceId");

-- CreateIndex
CREATE INDEX "AIResult_patientId_idx" ON "AIResult"("patientId");

-- CreateIndex
CREATE INDEX "AIResult_createdAt_idx" ON "AIResult"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_AppointmentTypeToService_AB_unique" ON "_AppointmentTypeToService"("A", "B");

-- CreateIndex
CREATE INDEX "_AppointmentTypeToService_B_index" ON "_AppointmentTypeToService"("B");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLocation" ADD CONSTRAINT "ProviderLocation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLocation" ADD CONSTRAINT "ProviderLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSchedule" ADD CONSTRAINT "ProviderSchedule_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyHistory" ADD CONSTRAINT "FamilyHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientConsent" ADD CONSTRAINT "PatientConsent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientCommunication" ADD CONSTRAINT "PatientCommunication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recall" ADD CONSTRAINT "Recall_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterProcedure" ADD CONSTRAINT "EncounterProcedure_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterProcedure" ADD CONSTRAINT "EncounterProcedure_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelehealthSession" ADD CONSTRAINT "TelehealthSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeScheduleItem" ADD CONSTRAINT "FeeScheduleItem_feeScheduleId_fkey" FOREIGN KEY ("feeScheduleId") REFERENCES "FeeSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeScheduleItem" ADD CONSTRAINT "FeeScheduleItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePlan" ADD CONSTRAINT "InsurancePlan_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimLine" ADD CONSTRAINT "ClaimLine_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimLine" ADD CONSTRAINT "ClaimLine_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "EncounterProcedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimPayment" ADD CONSTRAINT "ClaimPayment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPayment" ADD CONSTRAINT "PatientPayment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientBalance" ADD CONSTRAINT "PatientBalance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BAAgreement" ADD CONSTRAINT "BAAgreement_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbientSession" ADD CONSTRAINT "AmbientSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbientSession" ADD CONSTRAINT "AmbientSession_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbientSession" ADD CONSTRAINT "AmbientSession_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorAuthorization" ADD CONSTRAINT "PriorAuthorization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorAuthorization" ADD CONSTRAINT "PriorAuthorization_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorAuthorization" ADD CONSTRAINT "PriorAuthorization_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorAuthorization" ADD CONSTRAINT "PriorAuthorization_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayerAuthRules" ADD CONSTRAINT "PayerAuthRules_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineBookingSettings" ADD CONSTRAINT "OnlineBookingSettings_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineBooking" ADD CONSTRAINT "OnlineBooking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineBooking" ADD CONSTRAINT "OnlineBooking_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineBooking" ADD CONSTRAINT "OnlineBooking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineBooking" ADD CONSTRAINT "OnlineBooking_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FHIRConnection" ADD CONSTRAINT "FHIRConnection_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FHIRSyncLog" ADD CONSTRAINT "FHIRSyncLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "FHIRConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionRenewal" ADD CONSTRAINT "PrescriptionRenewal_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionFill" ADD CONSTRAINT "PrescriptionFill_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingStudy" ADD CONSTRAINT "ImagingStudy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingStudy" ADD CONSTRAINT "ImagingStudy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingStudy" ADD CONSTRAINT "ImagingStudy_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingSeries" ADD CONSTRAINT "ImagingSeries_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "ImagingStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingInstance" ADD CONSTRAINT "ImagingInstance_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ImagingSeries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalHealthScreening" ADD CONSTRAINT "MentalHealthScreening_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalHealthScreening" ADD CONSTRAINT "MentalHealthScreening_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalHealthScreening" ADD CONSTRAINT "MentalHealthScreening_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeForm" ADD CONSTRAINT "IntakeForm_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeFormSubmission" ADD CONSTRAINT "IntakeFormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "IntakeForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeFormSubmission" ADD CONSTRAINT "IntakeFormSubmission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeFormSubmission" ADD CONSTRAINT "IntakeFormSubmission_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotConversation" ADD CONSTRAINT "ChatbotConversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingSuggestion" ADD CONSTRAINT "CodingSuggestion_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncryptedDocument" ADD CONSTRAINT "EncryptedDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderStatusHistory" ADD CONSTRAINT "LabOrderStatusHistory_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSubmission" ADD CONSTRAINT "ClaimSubmission_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCheck" ADD CONSTRAINT "EligibilityCheck_patientInsuranceId_fkey" FOREIGN KEY ("patientInsuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrFirstTransaction" ADD CONSTRAINT "DrFirstTransaction_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEPCS" ADD CONSTRAINT "ProviderEPCS_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaxMessage" ADD CONSTRAINT "FaxMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskSession" ADD CONSTRAINT "KioskSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskSession" ADD CONSTRAINT "KioskSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskDevice" ADD CONSTRAINT "KioskDevice_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Superbill" ADD CONSTRAINT "Superbill_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Superbill" ADD CONSTRAINT "Superbill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientQualityMeasure" ADD CONSTRAINT "PatientQualityMeasure_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "QualityMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientQualityMeasure" ADD CONSTRAINT "PatientQualityMeasure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentTypeToService" ADD CONSTRAINT "_AppointmentTypeToService_A_fkey" FOREIGN KEY ("A") REFERENCES "AppointmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentTypeToService" ADD CONSTRAINT "_AppointmentTypeToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
