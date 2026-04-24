import { PrismaClient, Prisma, Specialty, UserRole, Gender, PatientStatus, Severity, AppointmentStatus, EncounterStatus, ClaimStatus, PaymentMethod, ConsentType, DocumentType, OrderType, LabOrderStatus, PriorAuthStatus, CommunicationType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const prisma = new PrismaClient()

// Generate a valid PDF using pdf-lib
async function generateSimplePDF(title: string, patientName: string, date: Date): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  let y = 750
  const leftMargin = 50
  const lineHeight = 18

  // Title
  page.drawText(title, { x: leftMargin, y, font: boldFont, size: 18, color: rgb(0, 0, 0) })
  y -= lineHeight * 2

  // Patient info
  page.drawText(`Patient: ${patientName}`, { x: leftMargin, y, font, size: 12 })
  y -= lineHeight

  page.drawText(`Date: ${dateStr}`, { x: leftMargin, y, font, size: 12 })
  y -= lineHeight

  page.drawText(`Document ID: DOC-${Date.now()}`, { x: leftMargin, y, font, size: 12 })
  y -= lineHeight * 2

  // Content
  const lines = [
    `This is a sample ${title.toLowerCase()} document generated for demonstration purposes.`,
    '',
    'Healthcare Practice Management System',
    'Mountain View Medical Center',
    '123 Healthcare Ave, Mountain View, CA 94040',
    '',
    'CONFIDENTIAL - Protected Health Information (PHI)',
    'This document contains confidential patient information protected under HIPAA.',
  ]

  for (const line of lines) {
    if (line) {
      page.drawText(line, { x: leftMargin, y, font, size: 11 })
    }
    y -= lineHeight
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

async function main() {
  console.log('Starting seed...')

  // Create Practice
  const practice = await prisma.practice.upsert({
    where: { id: 'practice-1' },
    update: {},
    create: {
      id: 'practice-1',
      name: 'Mountain View Medical Center',
      npi: '1234567890',
      specialty: Specialty.PRIMARY_CARE,
      phone: '(555) 123-4567',
      fax: '(555) 123-4568',
      email: 'info@mountainviewmed.com',
      website: 'https://mountainviewmed.com',
      address: '123 Healthcare Ave',
      city: 'Mountain View',
      state: 'CA',
      zip: '94040',
      timezone: 'America/Los_Angeles',
    },
  })
  console.log('Created practice:', practice.name)

  // Create Locations
  const mainLocation = await prisma.location.upsert({
    where: { id: 'location-1' },
    update: {},
    create: {
      id: 'location-1',
      name: 'Main Office',
      address: '123 Healthcare Ave',
      city: 'Mountain View',
      state: 'CA',
      zip: '94040',
      phone: '(555) 123-4567',
      practiceId: practice.id,
      operatingHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
      },
    },
  })

  const satelliteLocation = await prisma.location.upsert({
    where: { id: 'location-2' },
    update: {},
    create: {
      id: 'location-2',
      name: 'Satellite Clinic',
      address: '456 Wellness Blvd',
      city: 'Palo Alto',
      state: 'CA',
      zip: '94301',
      phone: '(555) 987-6543',
      practiceId: practice.id,
      operatingHours: {
        monday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
      },
    },
  })

  // Additional Locations (15 total)
  const additionalLocations = [
    { id: 'location-3', name: 'Downtown Medical Center', address: '789 Market Street', city: 'San Francisco', state: 'CA', zip: '94102', phone: '(415) 555-1234' },
    { id: 'location-4', name: 'East Bay Clinic', address: '321 Broadway Ave', city: 'Oakland', state: 'CA', zip: '94612', phone: '(510) 555-2345' },
    { id: 'location-5', name: 'South Bay Medical', address: '555 Stevens Creek Blvd', city: 'San Jose', state: 'CA', zip: '95128', phone: '(408) 555-3456' },
    { id: 'location-6', name: 'North Valley Clinic', address: '100 Medical Plaza', city: 'Sunnyvale', state: 'CA', zip: '94086', phone: '(408) 555-4567' },
    { id: 'location-7', name: 'Peninsula Health Center', address: '200 El Camino Real', city: 'Redwood City', state: 'CA', zip: '94063', phone: '(650) 555-5678' },
    { id: 'location-8', name: 'Fremont Family Practice', address: '45678 Mowry Ave', city: 'Fremont', state: 'CA', zip: '94538', phone: '(510) 555-6789' },
    { id: 'location-9', name: 'Cupertino Medical Group', address: '10100 De Anza Blvd', city: 'Cupertino', state: 'CA', zip: '95014', phone: '(408) 555-7890' },
    { id: 'location-10', name: 'Santa Clara Health', address: '3333 Mission College Blvd', city: 'Santa Clara', state: 'CA', zip: '95054', phone: '(408) 555-8901' },
    { id: 'location-11', name: 'Milpitas Urgent Care', address: '777 Great Mall Drive', city: 'Milpitas', state: 'CA', zip: '95035', phone: '(408) 555-9012' },
    { id: 'location-12', name: 'Los Altos Medical', address: '4500 El Camino Real', city: 'Los Altos', state: 'CA', zip: '94022', phone: '(650) 555-0123' },
    { id: 'location-13', name: 'Menlo Park Clinic', address: '1200 Oak Grove Ave', city: 'Menlo Park', state: 'CA', zip: '94025', phone: '(650) 555-1234' },
    { id: 'location-14', name: 'Foster City Health', address: '888 Metro Center Blvd', city: 'Foster City', state: 'CA', zip: '94404', phone: '(650) 555-2345' },
    { id: 'location-15', name: 'San Mateo Medical Center', address: '1500 S El Camino Real', city: 'San Mateo', state: 'CA', zip: '94402', phone: '(650) 555-3456' },
  ]

  const allLocations = [mainLocation, satelliteLocation]
  for (const loc of additionalLocations) {
    const location = await prisma.location.upsert({
      where: { id: loc.id },
      update: {},
      create: {
        ...loc,
        practiceId: practice.id,
        operatingHours: {
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
        },
      },
    })
    allLocations.push(location)
  }
  console.log('Created 15 locations')

  // Create Rooms
  const rooms = [
    { id: 'room-1', name: 'Exam Room 1', type: 'Exam', locationId: mainLocation.id },
    { id: 'room-2', name: 'Exam Room 2', type: 'Exam', locationId: mainLocation.id },
    { id: 'room-3', name: 'Procedure Room', type: 'Procedure', locationId: mainLocation.id },
    { id: 'room-4', name: 'Exam Room 1', type: 'Exam', locationId: satelliteLocation.id },
  ]

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: { ...room, equipment: [], capacity: 1 },
    })
  }
  console.log('Created rooms')

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = [
    {
      id: 'user-1',
      email: 'admin@practice.com',
      firstName: 'James',
      lastName: 'Wilson',
      role: UserRole.ADMIN,
      isProvider: true,
      providerData: {
        npi: '1234567890',
        specialty: 'Family Medicine',
        title: 'MD',
        color: '#0d9488',
        credentials: ['MD', 'FAAFP'],
      },
    },
    {
      id: 'user-2',
      email: 'lchen@practice.com',
      firstName: 'Lisa',
      lastName: 'Chen',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: {
        npi: '0987654321',
        specialty: 'Internal Medicine',
        title: 'MD',
        color: '#6366f1',
        credentials: ['MD', 'FACP'],
      },
    },
    {
      id: 'user-3',
      email: 'sthompson@practice.com',
      firstName: 'Sarah',
      lastName: 'Thompson',
      role: UserRole.NURSE,
      isProvider: false,
    },
    {
      id: 'user-4',
      email: 'mrodriguez@practice.com',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      role: UserRole.RECEPTIONIST,
      isProvider: false,
    },
    {
      id: 'user-5',
      email: 'jmartinez@practice.com',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      role: UserRole.BILLER,
      isProvider: false,
    },
    {
      id: 'user-6',
      email: 'manager@practice.com',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: UserRole.MANAGER,
      isProvider: false,
    },
    // Additional Providers (15 total)
    {
      id: 'user-7',
      email: 'apatel@practice.com',
      firstName: 'Amit',
      lastName: 'Patel',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1111111111', specialty: 'Cardiology', title: 'MD', color: '#ef4444', credentials: ['MD', 'FACC'] },
    },
    {
      id: 'user-8',
      email: 'mkim@practice.com',
      firstName: 'Michelle',
      lastName: 'Kim',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '2222222222', specialty: 'Pediatrics', title: 'MD', color: '#f97316', credentials: ['MD', 'FAAP'] },
    },
    {
      id: 'user-9',
      email: 'dgarcia@practice.com',
      firstName: 'David',
      lastName: 'Garcia',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '3333333333', specialty: 'Dermatology', title: 'MD', color: '#a855f7', credentials: ['MD', 'FAAD'] },
    },
    {
      id: 'user-10',
      email: 'rnguyen@practice.com',
      firstName: 'Rachel',
      lastName: 'Nguyen',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '4444444444', specialty: 'Neurology', title: 'MD', color: '#3b82f6', credentials: ['MD', 'FAAN'] },
    },
    {
      id: 'user-11',
      email: 'tsmith@practice.com',
      firstName: 'Thomas',
      lastName: 'Smith',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '5555555555', specialty: 'Orthopedics', title: 'MD', color: '#22c55e', credentials: ['MD', 'FAAOS'] },
    },
    {
      id: 'user-12',
      email: 'jlee@practice.com',
      firstName: 'Jennifer',
      lastName: 'Lee',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '6666666666', specialty: 'Psychiatry', title: 'MD', color: '#8b5cf6', credentials: ['MD', 'FAPA'] },
    },
    {
      id: 'user-13',
      email: 'cwilliams@practice.com',
      firstName: 'Christopher',
      lastName: 'Williams',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '7777777777', specialty: 'Emergency Medicine', title: 'MD', color: '#dc2626', credentials: ['MD', 'FACEP'] },
    },
    {
      id: 'user-14',
      email: 'ajohnson@practice.com',
      firstName: 'Angela',
      lastName: 'Johnson',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '8888888888', specialty: 'Oncology', title: 'MD', color: '#0ea5e9', credentials: ['MD', 'FACP'] },
    },
    {
      id: 'user-15',
      email: 'mbrown@practice.com',
      firstName: 'Marcus',
      lastName: 'Brown',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '9999999999', specialty: 'Gastroenterology', title: 'MD', color: '#f59e0b', credentials: ['MD', 'FACG'] },
    },
    {
      id: 'user-16',
      email: 'sdavis@practice.com',
      firstName: 'Stephanie',
      lastName: 'Davis',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1010101010', specialty: 'Endocrinology', title: 'MD', color: '#14b8a6', credentials: ['MD', 'FACE'] },
    },
    {
      id: 'user-17',
      email: 'rjones@practice.com',
      firstName: 'Ryan',
      lastName: 'Jones',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1212121212', specialty: 'Pulmonology', title: 'MD', color: '#64748b', credentials: ['MD', 'FCCP'] },
    },
    {
      id: 'user-18',
      email: 'ktaylor@practice.com',
      firstName: 'Karen',
      lastName: 'Taylor',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1313131313', specialty: 'Rheumatology', title: 'MD', color: '#ec4899', credentials: ['MD', 'FACR'] },
    },
    {
      id: 'user-19',
      email: 'jwhite@practice.com',
      firstName: 'Jonathan',
      lastName: 'White',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1414141414', specialty: 'Nephrology', title: 'MD', color: '#84cc16', credentials: ['MD', 'FASN'] },
    },
    {
      id: 'user-20',
      email: 'emartin@practice.com',
      firstName: 'Elizabeth',
      lastName: 'Martin',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1515151515', specialty: 'OB/GYN', title: 'MD', color: '#be185d', credentials: ['MD', 'FACOG'] },
    },
    {
      id: 'user-21',
      email: 'bthompson@practice.com',
      firstName: 'Brian',
      lastName: 'Thompson',
      role: UserRole.PROVIDER,
      isProvider: true,
      providerData: { npi: '1616161616', specialty: 'Urology', title: 'MD', color: '#0891b2', credentials: ['MD', 'FACS'] },
    },
  ]

  for (const userData of users) {
    const { isProvider, providerData, ...userFields } = userData

    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: {
        ...userFields,
        password: hashedPassword,
        practiceId: practice.id,
      },
    })

    if (isProvider && providerData) {
      await prisma.provider.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          practiceId: practice.id,
          ...providerData,
        },
      })
    }
  }
  console.log('Created users and providers')

  // Create Appointment Types
  const appointmentTypes = [
    { id: 'apt-type-1', name: 'New Patient', duration: 60, color: '#3b82f6', code: 'NEW' },
    { id: 'apt-type-2', name: 'Follow-up', duration: 30, color: '#22c55e', code: 'FU' },
    { id: 'apt-type-3', name: 'Annual Physical', duration: 45, color: '#8b5cf6', code: 'PHY' },
    { id: 'apt-type-4', name: 'Sick Visit', duration: 20, color: '#ef4444', code: 'SICK' },
    { id: 'apt-type-5', name: 'Procedure', duration: 45, color: '#f97316', code: 'PROC' },
    { id: 'apt-type-6', name: 'Consultation', duration: 30, color: '#14b8a6', code: 'CONSULT' },
    { id: 'apt-type-7', name: 'Telehealth', duration: 30, color: '#64748b', code: 'TELE' },
    { id: 'apt-type-8', name: 'Urgent', duration: 15, color: '#dc2626', code: 'URG' },
    { id: 'apt-type-9', name: 'Well Child Visit', duration: 30, color: '#f472b6', code: 'WCV' },
    { id: 'apt-type-10', name: 'Pre-Op Evaluation', duration: 45, color: '#a78bfa', code: 'PREOP' },
    { id: 'apt-type-11', name: 'Post-Op Follow-up', duration: 30, color: '#fb923c', code: 'POSTOP' },
    { id: 'apt-type-12', name: 'Immunization Only', duration: 15, color: '#4ade80', code: 'IMMUN' },
    { id: 'apt-type-13', name: 'Lab Review', duration: 15, color: '#38bdf8', code: 'LABR' },
    { id: 'apt-type-14', name: 'Mental Health', duration: 60, color: '#c084fc', code: 'MH' },
    { id: 'apt-type-15', name: 'Chronic Care Mgmt', duration: 30, color: '#facc15', code: 'CCM' },
    { id: 'apt-type-16', name: 'Worker Comp Eval', duration: 45, color: '#94a3b8', code: 'WC' },
  ]

  for (const type of appointmentTypes) {
    await prisma.appointmentType.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    })
  }
  console.log('Created appointment types')

  // Create Insurance Plans
  const insurancePlans = [
    { id: 'ins-1', name: 'Aetna PPO', payerName: 'Aetna', planType: 'PPO', payerId: 'AETNA001' },
    { id: 'ins-2', name: 'Blue Cross PPO', payerName: 'Blue Cross Blue Shield', planType: 'PPO', payerId: 'BCBS001' },
    { id: 'ins-3', name: 'UnitedHealthcare HMO', payerName: 'UnitedHealthcare', planType: 'HMO', payerId: 'UHC001' },
    { id: 'ins-4', name: 'Cigna PPO', payerName: 'Cigna', planType: 'PPO', payerId: 'CIGNA001' },
    { id: 'ins-5', name: 'Medicare Part B', payerName: 'Medicare', planType: 'Government', payerId: 'MDCR001' },
    { id: 'ins-6', name: 'Medicaid', payerName: 'Medicaid', planType: 'Government', payerId: 'MDCD001' },
    { id: 'ins-7', name: 'Humana PPO', payerName: 'Humana', planType: 'PPO', payerId: 'HUM001' },
    { id: 'ins-8', name: 'Self-Pay', payerName: 'Self-Pay', planType: 'Self', payerId: null },
    { id: 'ins-9', name: 'Kaiser Permanente HMO', payerName: 'Kaiser Permanente', planType: 'HMO', payerId: 'KAISER001' },
    { id: 'ins-10', name: 'Anthem Blue Cross PPO', payerName: 'Anthem Blue Cross', planType: 'PPO', payerId: 'ANTHEM001' },
    { id: 'ins-11', name: 'HealthNet HMO', payerName: 'HealthNet', planType: 'HMO', payerId: 'HNET001' },
    { id: 'ins-12', name: 'Tricare Standard', payerName: 'Tricare', planType: 'Government', payerId: 'TRICARE001' },
    { id: 'ins-13', name: 'Molina Healthcare', payerName: 'Molina', planType: 'HMO', payerId: 'MOLINA001' },
    { id: 'ins-14', name: 'WellCare PPO', payerName: 'WellCare', planType: 'PPO', payerId: 'WCARE001' },
    { id: 'ins-15', name: 'Centene Medicare Advantage', payerName: 'Centene', planType: 'Government', payerId: 'CENT001' },
    { id: 'ins-16', name: 'Oscar Health EPO', payerName: 'Oscar Health', planType: 'EPO', payerId: 'OSCAR001' },
  ]

  for (const plan of insurancePlans) {
    await prisma.insurancePlan.upsert({
      where: { id: plan.id },
      update: {},
      create: { ...plan, practiceId: practice.id },
    })
  }
  console.log('Created insurance plans')

  // Create Services (CPT Codes)
  const services = [
    { code: '99213', name: 'Office Visit Level 3', category: 'E/M', duration: 20 },
    { code: '99214', name: 'Office Visit Level 4', category: 'E/M', duration: 30 },
    { code: '99215', name: 'Office Visit Level 5', category: 'E/M', duration: 40 },
    { code: '99203', name: 'New Patient Level 3', category: 'E/M', duration: 45 },
    { code: '99204', name: 'New Patient Level 4', category: 'E/M', duration: 60 },
    { code: '99205', name: 'New Patient Level 5', category: 'E/M', duration: 75 },
    { code: '99396', name: 'Annual Wellness 40-64', category: 'Preventive', duration: 45 },
    { code: '99397', name: 'Annual Wellness 65+', category: 'Preventive', duration: 45 },
    { code: '93000', name: 'ECG with interpretation', category: 'Cardiology', duration: 15 },
    { code: '71046', name: 'Chest X-ray, 2 views', category: 'Radiology', duration: 15 },
    { code: '85025', name: 'CBC with differential', category: 'Laboratory', duration: 5 },
    { code: '80053', name: 'Comprehensive Metabolic Panel', category: 'Laboratory', duration: 5 },
    { code: '81003', name: 'Urinalysis', category: 'Laboratory', duration: 5 },
    { code: '36415', name: 'Venipuncture', category: 'Laboratory', duration: 5 },
    { code: '90471', name: 'Immunization Administration', category: 'Immunization', duration: 10 },
    { code: '90658', name: 'Flu Vaccine', category: 'Immunization', duration: 10 },
    { code: '99211', name: 'Office Visit Level 1', category: 'E/M', duration: 10 },
    { code: '99212', name: 'Office Visit Level 2', category: 'E/M', duration: 15 },
    { code: '99441', name: 'Telephone E/M 5-10 min', category: 'Telehealth', duration: 10 },
    { code: '99442', name: 'Telephone E/M 11-20 min', category: 'Telehealth', duration: 20 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { practiceId_code: { practiceId: practice.id, code: service.code } },
      update: {},
      create: { ...service, practiceId: practice.id },
    })
  }
  console.log('Created services')

  // Create Fee Schedules (15 total)
  const feeScheduleData = [
    { id: 'fee-1', name: 'Standard Fee Schedule', effectiveDate: new Date('2024-01-01'), isDefault: true, multiplier: 1.0 },
    { id: 'fee-2', name: 'Medicare Fee Schedule', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.8 },
    { id: 'fee-3', name: 'Medicaid Fee Schedule', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.65 },
    { id: 'fee-4', name: 'Blue Cross PPO', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.95 },
    { id: 'fee-5', name: 'Aetna PPO', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.92 },
    { id: 'fee-6', name: 'UnitedHealthcare', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.90 },
    { id: 'fee-7', name: 'Cigna PPO', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.88 },
    { id: 'fee-8', name: 'Humana PPO', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.85 },
    { id: 'fee-9', name: 'Kaiser Permanente', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.82 },
    { id: 'fee-10', name: 'Anthem Blue Cross', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.93 },
    { id: 'fee-11', name: 'HealthNet', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.78 },
    { id: 'fee-12', name: 'Tricare', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.75 },
    { id: 'fee-13', name: 'Workers Compensation', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 1.1 },
    { id: 'fee-14', name: 'Self-Pay Discount', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 0.70 },
    { id: 'fee-15', name: 'Premium Fee Schedule', effectiveDate: new Date('2024-01-01'), isDefault: false, multiplier: 1.2 },
  ]

  const baseFees: Record<string, number> = {
    '99213': 125, '99214': 175, '99215': 225,
    '99203': 175, '99204': 250, '99205': 325,
    '99396': 200, '99397': 200, '93000': 75,
    '71046': 95, '85025': 35, '80053': 45,
    '81003': 25, '36415': 20, '90471': 25,
    '90658': 35, '99211': 45, '99212': 85,
    '99441': 50, '99442': 85,
  }

  const allServices = await prisma.service.findMany({ where: { practiceId: practice.id } })

  for (const feeData of feeScheduleData) {
    const feeSchedule = await prisma.feeSchedule.upsert({
      where: { id: feeData.id },
      update: {},
      create: {
        id: feeData.id,
        name: feeData.name,
        effectiveDate: feeData.effectiveDate,
        isDefault: feeData.isDefault,
        practiceId: practice.id,
      },
    })

    for (const service of allServices) {
      if (baseFees[service.code]) {
        await prisma.feeScheduleItem.upsert({
          where: { feeScheduleId_serviceId: { feeScheduleId: feeSchedule.id, serviceId: service.id } },
          update: {},
          create: {
            feeScheduleId: feeSchedule.id,
            serviceId: service.id,
            fee: Math.round(baseFees[service.code] * feeData.multiplier * 100) / 100,
          },
        })
      }
    }
  }
  console.log('Created 15 fee schedules')

  // Create ICD-10 Codes
  const icdCodes = [
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
    { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
    { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
    { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory' },
    { code: 'K21.0', description: 'GERD with esophagitis', category: 'Digestive' },
    { code: 'F41.1', description: 'Generalized anxiety disorder', category: 'Mental Health' },
    { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
    { code: 'R07.9', description: 'Chest pain, unspecified', category: 'Symptoms' },
    { code: 'R51', description: 'Headache', category: 'Symptoms' },
    { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
    { code: 'J02.9', description: 'Acute pharyngitis, unspecified', category: 'Respiratory' },
    { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Infectious' },
    { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine' },
    { code: 'J45.909', description: 'Asthma, unspecified, uncomplicated', category: 'Respiratory' },
    { code: 'G43.909', description: 'Migraine, unspecified, not intractable', category: 'Neurological' },
    { code: 'M25.561', description: 'Pain in right knee', category: 'Musculoskeletal' },
    { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
    { code: 'R10.9', description: 'Abdominal pain, unspecified', category: 'Symptoms' },
    { code: 'R05', description: 'Cough', category: 'Symptoms' },
  ]

  for (const icd of icdCodes) {
    await prisma.iCD10Code.upsert({
      where: { code: icd.code },
      update: {},
      create: icd,
    })
  }
  console.log('Created ICD-10 codes')

  // Create CPT Codes
  const cptCodes = [
    { code: '99213', description: 'Office/outpatient visit, est patient, low-moderate complexity', category: 'E/M', workRVU: 1.30 },
    { code: '99214', description: 'Office/outpatient visit, est patient, moderate-high complexity', category: 'E/M', workRVU: 1.92 },
    { code: '99215', description: 'Office/outpatient visit, est patient, high complexity', category: 'E/M', workRVU: 2.80 },
    { code: '99203', description: 'Office/outpatient visit, new patient, low complexity', category: 'E/M', workRVU: 1.60 },
    { code: '99204', description: 'Office/outpatient visit, new patient, moderate complexity', category: 'E/M', workRVU: 2.60 },
    { code: '93000', description: 'Electrocardiogram, complete', category: 'Cardiology', workRVU: 0.17 },
    { code: '71046', description: 'Radiologic examination, chest, 2 views', category: 'Radiology', workRVU: 0.22 },
    { code: '85025', description: 'Blood count; complete (CBC)', category: 'Laboratory', workRVU: 0.00 },
    { code: '80053', description: 'Comprehensive metabolic panel', category: 'Laboratory', workRVU: 0.00 },
    { code: '99205', description: 'Office/outpatient visit, new patient, high complexity', category: 'E/M', workRVU: 3.50 },
    { code: '99211', description: 'Office/outpatient visit, est patient, minimal', category: 'E/M', workRVU: 0.18 },
    { code: '99212', description: 'Office/outpatient visit, est patient, straightforward', category: 'E/M', workRVU: 0.70 },
    { code: '99396', description: 'Preventive visit, est patient, 40-64 years', category: 'Preventive', workRVU: 1.50 },
    { code: '99397', description: 'Preventive visit, est patient, 65+ years', category: 'Preventive', workRVU: 1.60 },
    { code: '36415', description: 'Collection of venous blood by venipuncture', category: 'Laboratory', workRVU: 0.00 },
    { code: '90471', description: 'Immunization administration', category: 'Immunization', workRVU: 0.17 },
  ]

  for (const cpt of cptCodes) {
    await prisma.cPTCode.upsert({
      where: { code: cpt.code },
      update: {},
      create: cpt,
    })
  }
  console.log('Created CPT codes')

  // Get providers for patient/appointment creation
  const providers = await prisma.provider.findMany({ where: { practiceId: practice.id } })
  const provider1 = providers[0]
  const provider2 = providers[1] || providers[0]

  // Create Patients (20 patients)
  const patients = [
    { firstName: 'John', lastName: 'Smith', dateOfBirth: new Date('1979-03-15'), gender: Gender.MALE, phone: '(555) 111-2222', email: 'jsmith@email.com' },
    { firstName: 'Sarah', lastName: 'Johnson', dateOfBirth: new Date('1985-07-22'), gender: Gender.FEMALE, phone: '(555) 222-3333', email: 'sjohnson@email.com' },
    { firstName: 'Michael', lastName: 'Brown', dateOfBirth: new Date('1968-11-08'), gender: Gender.MALE, phone: '(555) 333-4444', email: 'mbrown@email.com' },
    { firstName: 'Emily', lastName: 'Davis', dateOfBirth: new Date('1992-02-28'), gender: Gender.FEMALE, phone: '(555) 444-5555', email: 'edavis@email.com' },
    { firstName: 'Robert', lastName: 'Miller', dateOfBirth: new Date('1955-09-12'), gender: Gender.MALE, phone: '(555) 555-6666', email: 'rmiller@email.com' },
    { firstName: 'Jennifer', lastName: 'Wilson', dateOfBirth: new Date('1988-04-05'), gender: Gender.FEMALE, phone: '(555) 666-7777', email: 'jwilson@email.com' },
    { firstName: 'David', lastName: 'Taylor', dateOfBirth: new Date('1975-12-30'), gender: Gender.MALE, phone: '(555) 777-8888', email: 'dtaylor@email.com' },
    { firstName: 'Lisa', lastName: 'Anderson', dateOfBirth: new Date('1963-06-17'), gender: Gender.FEMALE, phone: '(555) 888-9999', email: 'landerson@email.com' },
    { firstName: 'James', lastName: 'Thomas', dateOfBirth: new Date('1990-08-25'), gender: Gender.MALE, phone: '(555) 999-0000', email: 'jthomas@email.com' },
    { firstName: 'Patricia', lastName: 'Jackson', dateOfBirth: new Date('1972-01-10'), gender: Gender.FEMALE, phone: '(555) 000-1111', email: 'pjackson@email.com' },
    { firstName: 'William', lastName: 'Garcia', dateOfBirth: new Date('1981-05-20'), gender: Gender.MALE, phone: '(555) 112-2233', email: 'wgarcia@email.com' },
    { firstName: 'Elizabeth', lastName: 'Martinez', dateOfBirth: new Date('1977-09-03'), gender: Gender.FEMALE, phone: '(555) 223-3344', email: 'emartinez@email.com' },
    { firstName: 'Christopher', lastName: 'Robinson', dateOfBirth: new Date('1965-12-18'), gender: Gender.MALE, phone: '(555) 334-4455', email: 'crobinson@email.com' },
    { firstName: 'Amanda', lastName: 'Clark', dateOfBirth: new Date('1994-03-07'), gender: Gender.FEMALE, phone: '(555) 445-5566', email: 'aclark@email.com' },
    { firstName: 'Daniel', lastName: 'Lewis', dateOfBirth: new Date('1959-08-14'), gender: Gender.MALE, phone: '(555) 556-6677', email: 'dlewis@email.com' },
    { firstName: 'Michelle', lastName: 'Walker', dateOfBirth: new Date('1986-11-29'), gender: Gender.FEMALE, phone: '(555) 667-7788', email: 'mwalker@email.com' },
    { firstName: 'Joseph', lastName: 'Hall', dateOfBirth: new Date('1970-04-22'), gender: Gender.MALE, phone: '(555) 778-8899', email: 'jhall@email.com' },
    { firstName: 'Stephanie', lastName: 'Young', dateOfBirth: new Date('1983-07-11'), gender: Gender.FEMALE, phone: '(555) 889-9900', email: 'syoung@email.com' },
    { firstName: 'Andrew', lastName: 'King', dateOfBirth: new Date('1961-01-25'), gender: Gender.MALE, phone: '(555) 990-0011', email: 'aking@email.com' },
    { firstName: 'Nicole', lastName: 'Wright', dateOfBirth: new Date('1989-06-08'), gender: Gender.FEMALE, phone: '(555) 101-1122', email: 'nwright@email.com' },
  ]

  const createdPatients: string[] = []
  for (let i = 0; i < patients.length; i++) {
    const patientData = patients[i]
    const patient = await prisma.patient.upsert({
      where: { mrn: `MRN-2024-${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: {
        mrn: `MRN-2024-${String(i + 1).padStart(4, '0')}`,
        ...patientData,
        address: `${100 + i} Main Street`,
        city: 'Mountain View',
        state: 'CA',
        zip: '94040',
        practiceId: practice.id,
      },
    })
    createdPatients.push(patient.id)

    // Add insurance for most patients (18 out of 20)
    if (i < 18) {
      const verificationDate = new Date()
      verificationDate.setDate(verificationDate.getDate() - Math.floor(Math.random() * 30))
      const isVerified = i < 15 // First 15 are verified

      await prisma.patientInsurance.upsert({
        where: { patientId_priority: { patientId: patient.id, priority: 1 } },
        update: {},
        create: {
          patientId: patient.id,
          insurancePlanId: insurancePlans[i % 7].id,
          priority: 1,
          relationship: 'Self',
          subscriberName: `${patientData.firstName} ${patientData.lastName}`,
          subscriberId: `SUB${String(i + 1).padStart(8, '0')}`,
          groupNumber: `GRP${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`,
          isVerified: isVerified,
          verifiedDate: isVerified ? verificationDate : null,
          copay: [20, 25, 30, 35, 40][i % 5],
          deductible: [250, 500, 750, 1000, 1500][i % 5],
          deductibleMet: isVerified ? [100, 250, 500, 750, 0][i % 5] : null,
          effectiveDate: new Date('2024-01-01'),
          eligibilityData: isVerified ? {
            status: 'Active',
            coverageType: ['PPO', 'HMO', 'EPO'][i % 3],
            inNetwork: true,
            verificationId: `VER-${String(i + 1).padStart(6, '0')}`,
          } : Prisma.JsonNull,
        },
      })
    }

    // Add allergies for some patients
    if (i % 3 === 0) {
      await prisma.allergy.create({
        data: {
          patientId: patient.id,
          allergen: ['Penicillin', 'Sulfa', 'Latex', 'Aspirin'][i % 4],
          reaction: ['Rash', 'Anaphylaxis', 'Hives', 'GI upset'][i % 4],
          severity: [Severity.MILD, Severity.MODERATE, Severity.SEVERE, Severity.LIFE_THREATENING][i % 4],
        },
      })
    }

    // Add medications for some patients
    if (i % 2 === 0) {
      await prisma.medication.create({
        data: {
          patientId: patient.id,
          name: ['Lisinopril', 'Metformin', 'Atorvastatin', 'Omeprazole', 'Levothyroxine'][i % 5],
          dosage: ['10mg', '500mg', '20mg', '20mg', '50mcg'][i % 5],
          frequency: 'Daily',
          route: 'Oral',
          status: 'active',
        },
      })
    }

    // Add conditions for some patients
    if (i % 2 === 1) {
      await prisma.condition.create({
        data: {
          patientId: patient.id,
          icdCode: ['I10', 'E11.9', 'E78.5', 'F41.1', 'J45.909'][i % 5],
          name: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Anxiety', 'Asthma'][i % 5],
          status: 'active',
        },
      })
    }
  }
  console.log('Created patients with medical data')

  // Create Appointments (2-3 per patient = 40-60 appointments)
  const today = new Date()
  today.setHours(8, 0, 0, 0)

  const chiefComplaints = [
    'Annual checkup', 'Follow-up visit', 'Cough and cold', 'Back pain', 'Headache',
    'Blood pressure check', 'Diabetes management', 'Joint pain', 'Fatigue', 'Skin rash',
    'Chest pain evaluation', 'Weight management', 'Anxiety symptoms', 'Shortness of breath',
    'Abdominal pain', 'Dizziness', 'Ear pain', 'Sore throat', 'Eye exam', 'Vaccination',
    'Medication refill', 'Lab review', 'Post-op follow-up', 'New symptoms', 'Preventive care'
  ]

  const appointmentStatuses = [
    AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED,
    AppointmentStatus.SCHEDULED, AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED,
    AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.NO_SHOW, AppointmentStatus.CANCELLED
  ]

  let apptCounter = 0

  // First, create TODAY's appointments (12 appointments for Clinical page)
  const todayStatuses = [
    AppointmentStatus.CHECKED_IN, AppointmentStatus.CHECKED_IN, AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS, AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CONFIRMED, AppointmentStatus.CONFIRMED, AppointmentStatus.CONFIRMED,
    AppointmentStatus.SCHEDULED, AppointmentStatus.SCHEDULED,
    AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED
  ]

  for (let i = 0; i < 12; i++) {
    apptCounter++
    const patientId = createdPatients[i % createdPatients.length]
    const apptDate = new Date(today)
    apptDate.setHours(8 + i, 0, 0, 0) // 8am, 9am, 10am, etc.

    const typeIndex = i % appointmentTypes.length
    const type = appointmentTypes[typeIndex]
    const endDate = new Date(apptDate)
    endDate.setMinutes(endDate.getMinutes() + type.duration)

    const status = todayStatuses[i]

    await prisma.appointment.upsert({
      where: { id: `appt-today-${i + 1}` },
      update: {},
      create: {
        id: `appt-today-${i + 1}`,
        patientId: patientId,
        providerId: i % 2 === 0 ? provider1.id : provider2.id,
        locationId: mainLocation.id,
        roomId: rooms[i % 3].id,
        appointmentTypeId: type.id,
        scheduledStart: apptDate,
        scheduledEnd: endDate,
        status: status,
        chiefComplaint: chiefComplaints[i % chiefComplaints.length],
        isNewPatient: i < 2,
        checkedInAt: (status === AppointmentStatus.CHECKED_IN || status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.COMPLETED) ? apptDate : null,
      },
    })
  }
  console.log('Created 12 appointments for today')

  // Then create historical and future appointments
  for (let patientIndex = 0; patientIndex < createdPatients.length; patientIndex++) {
    const patientId = createdPatients[patientIndex]
    const numAppointments = 2 + (patientIndex % 2) // 2-3 appointments per patient

    for (let j = 0; j < numAppointments; j++) {
      apptCounter++
      const apptDate = new Date(today)
      // Past appointments (completed) and future appointments (scheduled/confirmed)
      if (j === 0) {
        apptDate.setDate(apptDate.getDate() - 30 - Math.floor(Math.random() * 60)) // 1-3 months ago
      } else if (j === 1) {
        apptDate.setDate(apptDate.getDate() - 1 - Math.floor(Math.random() * 14)) // Within last 2 weeks (not today)
      } else {
        apptDate.setDate(apptDate.getDate() + 1 + Math.floor(Math.random() * 30)) // Next month (not today)
      }
      apptDate.setHours(8 + (apptCounter % 9), (apptCounter % 2) * 30, 0, 0)

      const typeIndex = (patientIndex + j) % appointmentTypes.length
      const type = appointmentTypes[typeIndex]

      const endDate = new Date(apptDate)
      endDate.setMinutes(endDate.getMinutes() + type.duration)

      // Past appointments are completed, future are scheduled/confirmed
      let status: AppointmentStatus
      if (j === 0) {
        status = AppointmentStatus.COMPLETED
      } else if (j === 1) {
        status = appointmentStatuses[(patientIndex + j) % appointmentStatuses.length]
      } else {
        status = patientIndex % 2 === 0 ? AppointmentStatus.SCHEDULED : AppointmentStatus.CONFIRMED
      }

      await prisma.appointment.upsert({
        where: { id: `appt-${apptCounter}` },
        update: {},
        create: {
          id: `appt-${apptCounter}`,
          patientId: patientId,
          providerId: (patientIndex + j) % 2 === 0 ? provider1.id : provider2.id,
          locationId: patientIndex % 4 === 0 ? satelliteLocation.id : mainLocation.id,
          roomId: rooms[(patientIndex + j) % 3].id,
          appointmentTypeId: type.id,
          scheduledStart: apptDate,
          scheduledEnd: endDate,
          status: status,
          chiefComplaint: chiefComplaints[(patientIndex + j) % chiefComplaints.length],
          isNewPatient: j === 0 && patientIndex < 5,
          checkedInAt: status === AppointmentStatus.CHECKED_IN || status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.COMPLETED ? apptDate : null,
        },
      })
    }
  }
  console.log(`Created ${apptCounter} total appointments`)

  // Create Encounters (18 encounters)
  const encounterChiefComplaints = [
    'Follow-up visit', 'Annual physical', 'Cough and congestion', 'Back pain evaluation',
    'Blood pressure check', 'Diabetes management', 'Headache consultation', 'Joint pain',
    'Fatigue and weakness', 'Skin rash evaluation', 'Chest pain workup', 'Medication review',
    'Anxiety symptoms', 'Shortness of breath', 'Abdominal pain', 'Post-procedure follow-up',
    'Wellness check', 'Chronic pain management'
  ]

  const subjectiveNotes = [
    'Patient reports feeling better. No new symptoms.',
    'Patient here for routine physical. No complaints.',
    'Patient complains of cough for 3 days with nasal congestion.',
    'Patient reports lower back pain radiating to left leg.',
    'Patient here for blood pressure monitoring. Reports compliance with medications.',
    'Patient reports blood sugars running high this week.',
    'Patient reports severe headaches occurring 3 times per week.',
    'Patient complains of right knee pain worse with stairs.',
    'Patient reports fatigue and lack of energy for 2 weeks.',
    'Patient noticed rash on arms spreading over past 5 days.',
    'Patient reports chest tightness with exertion.',
    'Patient here to review and renew medications.',
    'Patient reports increased anxiety and difficulty sleeping.',
    'Patient reports shortness of breath with minimal activity.',
    'Patient complains of crampy abdominal pain for 3 days.',
    'Patient here for follow-up after minor procedure last week.',
    'Patient here for annual wellness examination.',
    'Patient reports chronic back pain, current medications not effective.'
  ]

  const objectiveNotes = [
    'Vital signs stable. Physical exam unremarkable.',
    'Well-appearing adult. Normal physical examination.',
    'Lungs with rhonchi bilaterally. Throat erythematous.',
    'Lumbar tenderness. Positive straight leg raise on left.',
    'BP 138/88 sitting, 142/90 standing. Regular rate and rhythm.',
    'Alert and oriented. Foot exam shows intact sensation.',
    'Neurological exam normal. No focal deficits.',
    'Knee with mild effusion. ROM limited by pain.',
    'Appears tired. No lymphadenopathy. Thyroid normal.',
    'Erythematous papular rash on bilateral upper extremities.',
    'Heart regular rate and rhythm. Lungs clear.',
    'Stable appearing. No acute distress.',
    'Appears anxious but cooperative. Vital signs normal.',
    'Oxygen saturation 94% on room air. Mild wheezing.',
    'Abdomen soft with mild tenderness in LLQ.',
    'Wound healing well. No signs of infection.',
    'Normal comprehensive physical examination.',
    'Paraspinal muscle tenderness. Normal neurological exam.'
  ]

  const assessmentNotes = [
    'Condition improving as expected.',
    'Healthy adult, preventive care discussed.',
    'Acute upper respiratory infection.',
    'Lumbar radiculopathy.',
    'Hypertension, suboptimally controlled.',
    'Type 2 diabetes, requiring medication adjustment.',
    'Tension-type headaches.',
    'Knee osteoarthritis.',
    'Fatigue, likely related to poor sleep hygiene.',
    'Contact dermatitis.',
    'Atypical chest pain, low cardiac risk.',
    'Chronic conditions stable on current regimen.',
    'Generalized anxiety disorder.',
    'Mild COPD exacerbation.',
    'Functional abdominal pain.',
    'Healing well post-procedure.',
    'Normal examination, continue preventive measures.',
    'Chronic low back pain, inadequate relief with current therapy.'
  ]

  const planNotes = [
    'Continue current medications. Follow up in 3 months.',
    'Continue healthy lifestyle. Vaccinations updated. Return in 1 year.',
    'Prescribed cough suppressant and decongestant. Rest and fluids.',
    'Physical therapy referral. NSAIDs for pain. MRI if no improvement.',
    'Increase lisinopril dose. Return in 2 weeks for BP check.',
    'Increase metformin. Check HbA1c in 3 months.',
    'Trial of preventive medication. Stress management discussed.',
    'Physical therapy. Consider injection if not improving.',
    'Sleep study ordered. Trial of vitamin D supplementation.',
    'Topical steroid cream. Avoid irritants.',
    'EKG and stress test ordered. Continue aspirin.',
    'Refills provided. Continue current plan.',
    'Started SSRI. Referral to counseling.',
    'Nebulizer treatment given. Short course of prednisone.',
    'Dietary modifications. Return if symptoms worsen.',
    'Wound care instructions provided. Return in 1 week.',
    'Labs ordered for routine screening. Return next year.',
    'Referral to pain management. Trial of muscle relaxant.'
  ]

  // Create encounters for each patient (1-2 per patient)
  // Store encounters by patient for linking to claims
  const patientEncounters: Record<string, string[]> = {}
  let encounterCounter = 0
  for (let patientIndex = 0; patientIndex < createdPatients.length; patientIndex++) {
    const patientId = createdPatients[patientIndex]
    const numEncounters = 1 + (patientIndex % 2) // 1-2 encounters per patient

    for (let j = 0; j < numEncounters; j++) {
      encounterCounter++
      const noteIndex = (patientIndex + j) % encounterChiefComplaints.length

      // Most encounters are signed, some in progress or draft
      let status: EncounterStatus
      if (j === 0) {
        status = EncounterStatus.SIGNED // First encounter is always signed (historical)
      } else {
        status = patientIndex % 5 === 0 ? EncounterStatus.PENDING_REVIEW : patientIndex % 3 === 0 ? EncounterStatus.IN_PROGRESS : EncounterStatus.SIGNED
      }
      const isSigned = status === EncounterStatus.SIGNED

      const encounterDate = new Date()
      encounterDate.setDate(encounterDate.getDate() - (j === 0 ? 30 + patientIndex * 3 : 7 + patientIndex))

      const encounter = await prisma.encounter.upsert({
        where: { encounterNumber: `ENC-2024-${String(encounterCounter).padStart(4, '0')}` },
        update: {},
        create: {
          encounterNumber: `ENC-2024-${String(encounterCounter).padStart(4, '0')}`,
          type: patientIndex % 5 === 4 ? 'Telehealth' : 'Office Visit',
          status: status,
          encounterDate: encounterDate,
          patientId: patientId,
          providerId: (patientIndex + j) % 2 === 0 ? provider1.id : provider2.id,
          chiefComplaint: encounterChiefComplaints[noteIndex],
          subjective: subjectiveNotes[noteIndex],
          objective: objectiveNotes[noteIndex],
          assessment: assessmentNotes[noteIndex],
          plan: planNotes[noteIndex],
          bloodPressureSystolic: 110 + Math.floor(Math.random() * 30),
          bloodPressureDiastolic: 70 + Math.floor(Math.random() * 20),
          heartRate: 65 + Math.floor(Math.random() * 25),
          temperature: 97.5 + Math.random() * 2,
          weight: 130 + Math.floor(Math.random() * 70),
          height: 62 + Math.floor(Math.random() * 12),
          respiratoryRate: 14 + Math.floor(Math.random() * 6),
          oxygenSaturation: 95 + Math.floor(Math.random() * 5),
          signedAt: isSigned ? encounterDate : null,
          signedBy: isSigned ? ((patientIndex + j) % 2 === 0 ? 'Dr. Wilson' : 'Dr. Chen') : null,
        },
      })

      // Store encounter ID for linking to claims
      if (!patientEncounters[patientId]) {
        patientEncounters[patientId] = []
      }
      patientEncounters[patientId].push(encounter.id)

      // Add diagnoses (1-2 per encounter)
      await prisma.encounterDiagnosis.create({
        data: {
          encounterId: encounter.id,
          sequence: 1,
          icdCode: icdCodes[noteIndex % icdCodes.length].code,
          description: icdCodes[noteIndex % icdCodes.length].description,
        },
      })

      if (patientIndex % 3 === 0) {
        await prisma.encounterDiagnosis.create({
          data: {
            encounterId: encounter.id,
            sequence: 2,
            icdCode: icdCodes[(noteIndex + 5) % icdCodes.length].code,
            description: icdCodes[(noteIndex + 5) % icdCodes.length].description,
          },
        })
      }

      // Add procedures
      await prisma.encounterProcedure.create({
        data: {
          encounterId: encounter.id,
          cptCode: services[(patientIndex + j) % 6].code,
          description: services[(patientIndex + j) % 6].name,
          quantity: 1,
          modifiers: [],
        },
      })
    }
  }
  console.log(`Created ${encounterCounter} encounters`)

  // Create Claims with complete data (service lines, payments, history)
  // Delete existing claims data first
  await prisma.claimPayment.deleteMany({})
  await prisma.claimLine.deleteMany({})
  await prisma.claim.deleteMany({})

  const claimStatusOptions = [
    ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PAID,
    ClaimStatus.PARTIAL, ClaimStatus.PARTIAL, ClaimStatus.SUBMITTED, ClaimStatus.PENDING,
    ClaimStatus.ACKNOWLEDGED, ClaimStatus.DENIED, ClaimStatus.APPEALED, ClaimStatus.CREATED,
    ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PARTIAL
  ]

  const denialReasons = [
    'Medical necessity not established',
    'Prior authorization required but not obtained',
    'Service not covered under patient plan',
    'Duplicate claim submission',
    'Timely filing limit exceeded'
  ]

  // Define service line details for richer claim data
  const claimServiceLines = [
    { cptCode: '99213', description: 'Office Visit Level 3', charge: 125 },
    { cptCode: '99214', description: 'Office Visit Level 4', charge: 175 },
    { cptCode: '99215', description: 'Office Visit Level 5', charge: 225 },
    { cptCode: '99203', description: 'New Patient Level 3', charge: 175 },
    { cptCode: '99204', description: 'New Patient Level 4', charge: 250 },
    { cptCode: '93000', description: 'ECG with interpretation', charge: 75 },
    { cptCode: '85025', description: 'CBC with differential', charge: 35 },
    { cptCode: '80053', description: 'Comprehensive Metabolic Panel', charge: 45 },
    { cptCode: '71046', description: 'Chest X-ray, 2 views', charge: 95 },
    { cptCode: '36415', description: 'Venipuncture', charge: 20 },
    { cptCode: '90471', description: 'Immunization Administration', charge: 25 },
    { cptCode: '81003', description: 'Urinalysis', charge: 25 },
    { cptCode: '99396', description: 'Annual Wellness 40-64', charge: 200 },
    { cptCode: '99397', description: 'Annual Wellness 65+', charge: 200 },
    { cptCode: '99211', description: 'Office Visit Level 1', charge: 45 },
  ]

  let claimCounter = 0
  for (let patientIndex = 0; patientIndex < createdPatients.length; patientIndex++) {
    const patientId = createdPatients[patientIndex]
    const patientInsurance = await prisma.patientInsurance.findFirst({
      where: { patientId },
    })

    if (!patientInsurance) continue // Skip patients without insurance

    const numClaims = 1 + (patientIndex % 2) // 1-2 claims per patient

    for (let j = 0; j < numClaims; j++) {
      claimCounter++
      const status = claimStatusOptions[(claimCounter - 1) % claimStatusOptions.length]

      // Determine number of service lines (2-4 per claim for richer data)
      const numLines = 2 + (claimCounter % 3) // 2, 3, or 4 lines

      // Calculate total charges based on service lines
      let totalCharges = 0
      const lineDetails: { cptCode: string; description: string; charge: number }[] = []
      for (let k = 0; k < numLines; k++) {
        const serviceIndex = (claimCounter + k) % claimServiceLines.length
        lineDetails.push(claimServiceLines[serviceIndex])
        totalCharges += claimServiceLines[serviceIndex].charge
      }

      const isPaid = status === ClaimStatus.PAID
      const isPartial = status === ClaimStatus.PARTIAL
      const isDenied = status === ClaimStatus.DENIED || status === ClaimStatus.APPEALED
      const isSubmitted = status !== ClaimStatus.CREATED

      // Calculate amounts
      let insurancePaidAmount: number | null = null
      let adjustmentAmount: number | null = null
      let patientResponsibility = totalCharges

      if (isPaid) {
        adjustmentAmount = Math.floor(totalCharges * 0.15)
        insurancePaidAmount = Math.floor((totalCharges - adjustmentAmount) * 0.85)
        patientResponsibility = totalCharges - adjustmentAmount - insurancePaidAmount
      } else if (isPartial) {
        adjustmentAmount = Math.floor(totalCharges * 0.1)
        insurancePaidAmount = Math.floor((totalCharges - adjustmentAmount) * 0.6)
        patientResponsibility = totalCharges - adjustmentAmount - insurancePaidAmount
      }

      const serviceDate = new Date()
      serviceDate.setDate(serviceDate.getDate() - (20 + claimCounter * 5))

      const submittedDate = isSubmitted ? new Date(serviceDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null
      const processedDate = isPaid || isPartial || isDenied ? new Date(serviceDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null

      // Get encounter for this patient (use first available, cycling through)
      const encounters = patientEncounters[patientId] || []
      const encounterId = encounters.length > 0 ? encounters[j % encounters.length] : null

      const claim = await prisma.claim.create({
        data: {
          claimNumber: `CLM-2024-${String(claimCounter).padStart(4, '0')}`,
          status: status,
          serviceDate: serviceDate,
          submittedDate: submittedDate,
          processedDate: processedDate,
          totalCharges: totalCharges,
          allowedAmount: isPaid || isPartial ? totalCharges - (adjustmentAmount || 0) : null,
          paidAmount: insurancePaidAmount,
          adjustmentAmount: adjustmentAmount,
          patientResponsibility: patientResponsibility,
          placeOfService: '11',
          patientId,
          providerId: (patientIndex + j) % 2 === 0 ? provider1.id : provider2.id,
          encounterId: encounterId,
          insuranceId: patientInsurance.id,
          insurancePlanId: patientInsurance.insurancePlanId,
          denialReason: isDenied ? denialReasons[(claimCounter) % denialReasons.length] : null,
          denialCode: isDenied ? ['CO-50', 'CO-4', 'PR-96', 'CO-97', 'CO-16'][claimCounter % 5] : null,
          notes: `Claim for services rendered on ${serviceDate.toLocaleDateString()}`,
          eraReceived: isPaid || isPartial,
          eraDate: isPaid || isPartial ? processedDate : null,
        },
      })

      // Add service lines (2-4 per claim)
      for (let k = 0; k < lineDetails.length; k++) {
        const line = lineDetails[k]
        const allowedAmount = isPaid || isPartial ? Math.floor(line.charge * 0.85) : null
        const linePaidAmount = isPaid ? Math.floor((allowedAmount || 0) * 0.9) :
                               isPartial ? Math.floor((allowedAmount || 0) * 0.6) : null

        await prisma.claimLine.create({
          data: {
            claimId: claim.id,
            lineNumber: k + 1,
            cptCode: line.cptCode,
            description: line.description,
            quantity: 1,
            chargeAmount: line.charge,
            allowedAmount: allowedAmount,
            paidAmount: linePaidAmount,
            adjustmentAmount: allowedAmount ? Math.floor(line.charge * 0.15) : null,
            modifiers: k === 1 ? ['25'] : k === 2 ? ['59'] : [],
            diagnosisPointers: k === 0 ? [1] : [1, 2],
            remarkCodes: isDenied ? ['CO-50'] : [],
            denialReason: isDenied ? denialReasons[k % denialReasons.length] : null,
          },
        })
      }

      // Add payments for most claims (all except CREATED status)
      if (status !== ClaimStatus.CREATED) {
        const paymentDate = new Date(serviceDate.getTime() + 21 * 24 * 60 * 60 * 1000)

        // Calculate payment amount based on status
        let paymentAmount = 0
        if (isPaid) {
          paymentAmount = insurancePaidAmount || Math.floor(totalCharges * 0.7)
        } else if (isPartial) {
          paymentAmount = insurancePaidAmount || Math.floor(totalCharges * 0.4)
        } else if (status === ClaimStatus.PENDING || status === ClaimStatus.ACKNOWLEDGED) {
          // Partial payment received while pending
          paymentAmount = Math.floor(totalCharges * 0.3)
        } else if (status === ClaimStatus.SUBMITTED) {
          // Small initial payment
          paymentAmount = Math.floor(totalCharges * 0.2)
        } else if (isDenied) {
          // Denied claims might have initial payment before denial
          paymentAmount = Math.floor(totalCharges * 0.1)
        }

        if (paymentAmount > 0) {
          await prisma.claimPayment.create({
            data: {
              claimId: claim.id,
              paymentDate: paymentDate,
              amount: paymentAmount,
              checkNumber: `EFT${String(100000 + claimCounter).padStart(8, '0')}`,
              payerType: 'Insurance',
              reference: `ERA-${String(100000 + claimCounter)}`,
            },
          })

          // Add second insurance payment for paid claims
          if (isPaid && claimCounter % 2 === 0) {
            const secondPaymentDate = new Date(paymentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            await prisma.claimPayment.create({
              data: {
                claimId: claim.id,
                paymentDate: secondPaymentDate,
                amount: Math.floor(totalCharges * 0.15),
                checkNumber: `EFT${String(100000 + claimCounter + 1000).padStart(8, '0')}`,
                payerType: 'Insurance',
                reference: `ERA-${String(100000 + claimCounter + 1000)}`,
              },
            })
          }

          // Add patient payment for most paid/partial claims
          if ((isPaid || isPartial) && patientResponsibility > 0) {
            const patientPaymentDate = new Date(paymentDate.getTime() + 14 * 24 * 60 * 60 * 1000)
            await prisma.claimPayment.create({
              data: {
                claimId: claim.id,
                paymentDate: patientPaymentDate,
                amount: Math.min(patientResponsibility, Math.floor(totalCharges * 0.1)),
                checkNumber: null,
                payerType: 'Patient',
                reference: `PAT-${String(200000 + claimCounter)}`,
              },
            })
          }
        }
      }
    }
  }
  console.log(`Created ${claimCounter} claims with service lines and payments`)

  // Create Patient Payments (18 payments)
  // First delete existing patient payments to avoid conflicts
  await prisma.patientPayment.deleteMany({})

  for (let i = 0; i < 18; i++) {
    const patientId = createdPatients[i % createdPatients.length]
    const methods = [
      PaymentMethod.CREDIT_CARD, PaymentMethod.CREDIT_CARD, PaymentMethod.CREDIT_CARD,
      PaymentMethod.DEBIT_CARD, PaymentMethod.DEBIT_CARD,
      PaymentMethod.CASH, PaymentMethod.CASH,
      PaymentMethod.CHECK, PaymentMethod.CHECK,
      PaymentMethod.ACH, PaymentMethod.CREDIT_CARD, PaymentMethod.CREDIT_CARD,
      PaymentMethod.DEBIT_CARD, PaymentMethod.CASH,
      PaymentMethod.CHECK, PaymentMethod.CREDIT_CARD,
      PaymentMethod.ACH, PaymentMethod.DEBIT_CARD,
    ]
    const amounts = [25, 30, 35, 50, 75, 100, 125, 150, 200, 250, 25, 35, 40, 50, 175, 30, 300, 45]
    const notes = [
      'Copay for office visit', 'Patient responsibility after insurance', 'Deductible payment',
      'Balance payment', 'Payment on account', 'Self-pay visit', 'Copay for procedure',
      'Partial payment on balance', 'Full balance payment', 'Coinsurance payment',
      'Follow-up copay', 'Lab work copay', 'Specialist copay', 'Same-day payment',
      'Outstanding balance payment', 'Prescription copay', 'Large balance payment', 'Imaging copay'
    ]

    const method = methods[i]
    let reference: string | null = null
    if (method === PaymentMethod.CHECK) {
      reference = `CHK-${String(1000 + i).padStart(6, '0')}`
    } else if (method === PaymentMethod.CREDIT_CARD || method === PaymentMethod.DEBIT_CARD) {
      reference = `CARD-****${String(1000 + i).slice(-4)}`
    } else if (method === PaymentMethod.ACH) {
      reference = `ACH-${String(10000 + i)}`
    }

    await prisma.patientPayment.create({
      data: {
        patientId: patientId,
        amount: amounts[i],
        date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
        method: method,
        notes: notes[i],
        reference: reference,
      },
    })
  }
  console.log('Created patient payments')

  // Create Patient Documents (at least 2-3 per patient)
  await prisma.patientDocument.deleteMany({})

  const documentTypes = [
    { type: DocumentType.INTAKE_FORM, name: 'Patient Intake Form', category: 'Administrative', mimeType: 'application/pdf' },
    { type: DocumentType.CONSENT, name: 'HIPAA Consent Form', category: 'Legal', mimeType: 'application/pdf' },
    { type: DocumentType.INSURANCE_CARD, name: 'Insurance Card - Front', category: 'Insurance', mimeType: 'image/jpeg' },
    { type: DocumentType.INSURANCE_CARD, name: 'Insurance Card - Back', category: 'Insurance', mimeType: 'image/jpeg' },
    { type: DocumentType.ID, name: 'Driver License', category: 'Identification', mimeType: 'image/jpeg' },
    { type: DocumentType.LAB_RESULT, name: 'CBC Results', category: 'Lab Results', mimeType: 'application/pdf' },
    { type: DocumentType.LAB_RESULT, name: 'Comprehensive Metabolic Panel', category: 'Lab Results', mimeType: 'application/pdf' },
    { type: DocumentType.LAB_RESULT, name: 'Lipid Panel Results', category: 'Lab Results', mimeType: 'application/pdf' },
    { type: DocumentType.IMAGING, name: 'Chest X-Ray Report', category: 'Imaging', mimeType: 'application/pdf' },
    { type: DocumentType.IMAGING, name: 'MRI Lumbar Spine', category: 'Imaging', mimeType: 'application/pdf' },
    { type: DocumentType.REFERRAL, name: 'Cardiology Referral', category: 'Referrals', mimeType: 'application/pdf' },
    { type: DocumentType.REFERRAL, name: 'Physical Therapy Referral', category: 'Referrals', mimeType: 'application/pdf' },
    { type: DocumentType.CORRESPONDENCE, name: 'Specialist Consultation Note', category: 'Correspondence', mimeType: 'application/pdf' },
    { type: DocumentType.OTHER, name: 'Prior Authorization Letter', category: 'Administrative', mimeType: 'application/pdf' },
  ]

  for (let i = 0; i < createdPatients.length; i++) {
    const patientId = createdPatients[i]
    // Each patient gets 3-5 documents
    const numDocs = 3 + (i % 3)

    for (let j = 0; j < numDocs; j++) {
      const docInfo = documentTypes[(i + j) % documentTypes.length]
      const createdDate = new Date()
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180)) // Within last 6 months

      await prisma.patientDocument.create({
        data: {
          patientId: patientId,
          name: docInfo.name,
          type: docInfo.type,
          category: docInfo.category,
          filePath: `/documents/${patientId}/${docInfo.type.toLowerCase()}_${j + 1}.${docInfo.mimeType.split('/')[1]}`,
          fileSize: 50000 + Math.floor(Math.random() * 500000), // 50KB to 550KB
          mimeType: docInfo.mimeType,
          description: `${docInfo.name} uploaded on ${createdDate.toLocaleDateString()}`,
          createdAt: createdDate,
        },
      })
    }
  }
  console.log('Created patient documents')

  // Create Waitlist Entries
  const waitlistReasons = [
    'Seeking earlier appointment for annual physical',
    'Need to see provider urgently for worsening symptoms',
    'Prefer morning appointment slot',
    'Need appointment before insurance expires',
    'Reschedule due to work conflict',
    'Need follow-up sooner than scheduled',
    'Waiting for cancellation spot',
    'Prefer afternoon appointment',
    'Urgent consultation needed',
    'Seeking earlier date for procedure',
    'Need appointment with specific provider',
    'Travel plans require earlier appointment',
    'Symptoms have worsened, need sooner visit',
    'Insurance authorization received, ready to schedule',
    'Requested callback for any opening',
    'Flexible schedule, any availability works',
    'Prefers weekday appointments only',
    'Looking for telehealth option',
  ]

  const preferredDaysOptions = [
    ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    ['TUESDAY', 'THURSDAY'],
    ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    ['MONDAY'],
    ['FRIDAY'],
    ['WEDNESDAY', 'THURSDAY'],
    ['TUESDAY', 'WEDNESDAY'],
    ['MONDAY', 'FRIDAY'],
  ]

  const priorities = ['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'URGENT']
  const statuses = ['WAITING', 'WAITING', 'WAITING', 'CONTACTED', 'SCHEDULED', 'CANCELLED']

  for (let i = 0; i < 18; i++) {
    const status = statuses[i % statuses.length]
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - (18 - i)) // Spread out creation dates

    await prisma.waitlistEntry.upsert({
      where: { id: `waitlist-${i + 1}` },
      update: {},
      create: {
        id: `waitlist-${i + 1}`,
        patientId: createdPatients[i % createdPatients.length],
        providerId: i % 3 === 0 ? provider1.id : i % 3 === 1 ? provider2.id : null,
        appointmentTypeId: appointmentTypes[i % appointmentTypes.length].id,
        priority: priorities[i % priorities.length],
        status: status,
        reason: waitlistReasons[i % waitlistReasons.length],
        notes: i % 3 === 0 ? 'Patient prefers to be contacted by phone' : i % 3 === 1 ? 'Email contact preferred' : null,
        preferredDays: preferredDaysOptions[i % preferredDaysOptions.length],
        preferredTimeStart: i % 2 === 0 ? '09:00' : '13:00',
        preferredTimeEnd: i % 2 === 0 ? '12:00' : '17:00',
        contactedAt: status === 'CONTACTED' || status === 'SCHEDULED' ? new Date() : null,
        scheduledAt: status === 'SCHEDULED' ? new Date() : null,
        createdAt: createdDate,
      },
    })
  }
  console.log('Created waitlist entries')

  // ============ NEW FEATURES SEED DATA ============

  // Create Encrypted Documents
  await prisma.encryptedDocument.deleteMany({})

  const documentCategories = ['CLINICAL', 'BILLING', 'ADMINISTRATIVE', 'FAX', 'LAB', 'IMAGING', 'INSURANCE', 'CONSENT']
  const documentTypeNames = [
    'Lab Results', 'Insurance Card', 'Referral Letter', 'Consultation Notes',
    'Prior Authorization', 'Medical Records Request', 'Discharge Summary',
    'Radiology Report', 'Pathology Report', 'Prescription', 'Consent Form',
    'Patient Statement', 'EOB Document', 'Clinical Notes', 'Procedure Report'
  ]

  for (let i = 0; i < 30; i++) {
    const patientId = i < 20 ? createdPatients[i % createdPatients.length] : null
    const category = documentCategories[i % documentCategories.length]
    const docType = documentTypeNames[i % documentTypeNames.length]
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90))

    // Get patient name for PDF content
    const patientIndex = patientId ? createdPatients.indexOf(patientId) : -1
    const patientData = patientIndex >= 0 ? patients[patientIndex] : null
    const patientName = patientData ? `${patientData.firstName} ${patientData.lastName}` : 'General Document'

    // Generate actual PDF content
    const pdfContent = await generateSimplePDF(docType, patientName, createdDate)

    await prisma.encryptedDocument.create({
      data: {
        originalName: `${docType.replace(/\s+/g, '_')}_${i + 1}.pdf`,
        encryptedPath: null,
        encryptionKeyId: `key-${Math.floor(i / 10) + 1}`,
        fileSize: pdfContent.length,
        mimeType: 'application/pdf',
        checksum: `sha256-${Buffer.from(`doc-${i}`).toString('hex').slice(0, 64)}`,
        fileContent: pdfContent,
        category: category,
        documentType: docType,
        patientId: patientId,
        accessLevel: i % 4 === 0 ? 'ADMIN' : i % 3 === 0 ? 'BILLING' : 'PROVIDER',
        createdAt: createdDate,
        createdBy: users[i % 6].id,
      },
    })
  }
  console.log('Created encrypted documents')

  // Create Lab Orders
  await prisma.labOrderStatusHistory.deleteMany({})
  await prisma.labOrder.deleteMany({})

  const labNames = ['Quest Diagnostics', 'LabCorp', 'ARUP Laboratories', 'Mayo Clinic Labs', 'In-House Lab']
  const specimenTypes = ['Blood', 'Urine', 'Stool', 'Swab', 'Tissue']
  const labTestCodes = [
    ['85025', '80053'], // CBC, CMP
    ['80061', '82465'], // Lipid Panel, Cholesterol
    ['84443', '84439'], // TSH, Free T4
    ['83036'], // HbA1c
    ['81001', '87086'], // Urinalysis, Urine Culture
    ['87880'], // Strep Test
    ['86580'], // TB Test
    ['82947', '82950'], // Glucose, GTT
  ]
  const labStatuses: LabOrderStatus[] = [
    LabOrderStatus.PENDING, LabOrderStatus.SPECIMEN_COLLECTED, LabOrderStatus.SENT_TO_LAB,
    LabOrderStatus.RESULTS_RECEIVED, LabOrderStatus.REVIEWED, LabOrderStatus.COMPLETED,
    LabOrderStatus.PENDING, LabOrderStatus.SENT_TO_LAB, LabOrderStatus.RESULTS_RECEIVED,
    LabOrderStatus.COMPLETED, LabOrderStatus.COMPLETED, LabOrderStatus.REVIEWED,
  ]

  for (let i = 0; i < 25; i++) {
    const patientId = createdPatients[i % createdPatients.length]
    const status = labStatuses[i % labStatuses.length]
    const orderedDate = new Date()
    orderedDate.setDate(orderedDate.getDate() - (25 - i) * 2)

    const testCodesIndex = i % labTestCodes.length
    const testCodes = labTestCodes[testCodesIndex]
    const testDescriptions = testCodes.map(code => {
      const cpt = cptCodes.find(c => c.code === code)
      return cpt?.description || `Lab Test ${code}`
    })

    const labOrder = await prisma.labOrder.create({
      data: {
        orderNumber: `LAB-2024-${String(i + 1).padStart(4, '0')}`,
        status: status,
        orderedAt: orderedDate,
        orderedBy: providers[i % providers.length].id,
        labName: labNames[i % labNames.length],
        specimenType: specimenTypes[i % specimenTypes.length],
        testCodes: testCodes,
        testDescriptions: testDescriptions,
        priority: i % 5 === 0 ? 'STAT' : i % 3 === 0 ? 'URGENT' : 'ROUTINE',
        specimenCollectedAt: ['SPECIMEN_COLLECTED', 'SENT_TO_LAB', 'RESULTS_RECEIVED', 'REVIEWED', 'COMPLETED'].includes(status) ? new Date(orderedDate.getTime() + 24 * 60 * 60 * 1000) : null,
        specimenSentAt: ['SENT_TO_LAB', 'RESULTS_RECEIVED', 'REVIEWED', 'COMPLETED'].includes(status) ? new Date(orderedDate.getTime() + 48 * 60 * 60 * 1000) : null,
        resultsReceivedAt: ['RESULTS_RECEIVED', 'REVIEWED', 'COMPLETED'].includes(status) ? new Date(orderedDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        reviewedAt: ['REVIEWED', 'COMPLETED'].includes(status) ? new Date(orderedDate.getTime() + 6 * 24 * 60 * 60 * 1000) : null,
        reviewedBy: ['REVIEWED', 'COMPLETED'].includes(status) ? providers[i % providers.length].id : null,
        patientNotified: status === LabOrderStatus.COMPLETED,
        patientNotifiedAt: status === LabOrderStatus.COMPLETED ? new Date(orderedDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
        icdCodes: ['E11.9', 'I10', 'E78.5'].slice(0, 1 + (i % 2)),
        clinicalNotes: i % 3 === 0 ? 'Fasting required' : i % 3 === 1 ? 'Annual screening' : 'Follow-up on abnormal results',
        patientId: patientId,
        encounterId: patientEncounters[patientId]?.[0] || null,
      },
    })

    // Add status history
    await prisma.labOrderStatusHistory.create({
      data: {
        labOrderId: labOrder.id,
        status: LabOrderStatus.PENDING,
        changedAt: orderedDate,
        changedBy: providers[i % providers.length].userId,
        notes: 'Order created',
      },
    })
  }
  console.log('Created lab orders')

  // Create Fax Messages
  await prisma.faxMessage.deleteMany({})

  const faxCategories = ['LAB_RESULT', 'REFERRAL', 'RX_REQUEST', 'PRIOR_AUTH', 'MEDICAL_RECORDS', 'CONSULTATION', 'INSURANCE']
  const faxStatuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'RECEIVED', 'RECEIVED', 'PENDING', 'SENDING', 'FAILED']

  for (let i = 0; i < 20; i++) {
    const direction = i % 3 === 0 ? 'INBOUND' : 'OUTBOUND'
    const status = direction === 'INBOUND' ? 'RECEIVED' : faxStatuses[i % faxStatuses.length]
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - (20 - i))

    await prisma.faxMessage.create({
      data: {
        direction: direction,
        status: status,
        twilioSid: `SM${Buffer.from(`fax-${i}-${Date.now()}`).toString('hex').slice(0, 32)}`,
        fromNumber: direction === 'INBOUND' ? `+1555${String(1000000 + i).slice(-7)}` : '+15551234567',
        toNumber: direction === 'OUTBOUND' ? `+1555${String(2000000 + i).slice(-7)}` : '+15551234567',
        numPages: 1 + (i % 5),
        quality: 'FINE',
        documentPath: `/fax/${direction.toLowerCase()}/${Date.now()}_${i}.pdf`,
        patientId: i < 15 ? createdPatients[i % createdPatients.length] : null,
        category: faxCategories[i % faxCategories.length],
        processedAt: status === 'RECEIVED' || status === 'DELIVERED' ? createdDate : null,
        processedBy: status === 'RECEIVED' ? users[i % 6].id : null,
        sentAt: direction === 'OUTBOUND' && status === 'DELIVERED' ? createdDate : null,
        receivedAt: direction === 'INBOUND' ? createdDate : null,
        failedAt: status === 'FAILED' ? createdDate : null,
        errorMessage: status === 'FAILED' ? 'Recipient fax machine did not answer' : null,
        createdAt: createdDate,
      },
    })
  }
  console.log('Created fax messages')

  // Create Superbills
  await prisma.superbill.deleteMany({})

  const encounterIds = Object.values(patientEncounters).flat().slice(0, 15)

  for (let i = 0; i < 15; i++) {
    const encounterId = encounterIds[i]
    if (!encounterId) continue

    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: { patient: true },
    })
    if (!encounter) continue

    const serviceDate = new Date(encounter.encounterDate)
    const diagnoses = [
      { code: 'I10', description: 'Essential hypertension' },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    ].slice(0, 1 + (i % 2))

    const procedures = [
      { code: '99214', description: 'Office Visit Level 4', fee: 175, units: 1 },
      { code: '85025', description: 'CBC with differential', fee: 35, units: 1 },
      { code: '80053', description: 'Comprehensive Metabolic Panel', fee: 45, units: 1 },
    ].slice(0, 1 + (i % 3))

    const totalCharges = procedures.reduce((sum, p) => sum + p.fee * p.units, 0)
    const patientEstimate = Math.floor(totalCharges * 0.2)
    const amountPaid = i % 3 === 0 ? patientEstimate : i % 3 === 1 ? Math.floor(patientEstimate / 2) : 0

    await prisma.superbill.create({
      data: {
        superbillNumber: `SB-2024-${String(i + 1).padStart(4, '0')}`,
        encounterId: encounterId,
        patientId: encounter.patientId,
        providerId: encounter.providerId,
        serviceDate: serviceDate,
        diagnoses: diagnoses,
        procedures: procedures,
        totalCharges: totalCharges,
        insuranceEstimate: totalCharges - patientEstimate,
        patientEstimate: patientEstimate,
        amountPaid: amountPaid,
        paymentCollected: amountPaid > 0 ? amountPaid : null,
        paymentMethod: amountPaid > 0 ? 'CREDIT_CARD' : null,
        printedAt: i % 2 === 0 ? serviceDate : null,
        emailedAt: i % 3 === 0 ? serviceDate : null,
        emailedTo: i % 3 === 0 ? encounter.patient.email : null,
        createdAt: serviceDate,
      },
    })
  }
  console.log('Created superbills')

  // Create Quality Measures
  await prisma.patientQualityMeasure.deleteMany({})
  await prisma.qualityMeasure.deleteMany({})

  const qualityMeasures = [
    {
      measureId: 'CMS122v11',
      measureTitle: 'Diabetes: Hemoglobin A1c Poor Control (>9%)',
      category: 'QUALITY',
      domain: 'Effective Clinical Care',
      description: 'Percentage of patients 18-75 with diabetes whose most recent HbA1c level during the measurement period was >9.0%',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 32.0,
      benchmark4Star: 22.0,
      benchmark5Star: 12.0,
    },
    {
      measureId: 'CMS165v11',
      measureTitle: 'Controlling High Blood Pressure',
      category: 'QUALITY',
      domain: 'Effective Clinical Care',
      description: 'Percentage of patients 18-85 with diagnosis of hypertension whose blood pressure was adequately controlled (<140/90)',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 58.0,
      benchmark4Star: 68.0,
      benchmark5Star: 78.0,
    },
    {
      measureId: 'CMS130v11',
      measureTitle: 'Colorectal Cancer Screening',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of patients 50-75 who had appropriate screening for colorectal cancer',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 45.0,
      benchmark4Star: 58.0,
      benchmark5Star: 72.0,
    },
    {
      measureId: 'CMS125v11',
      measureTitle: 'Breast Cancer Screening',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of women 50-74 who had a mammogram to screen for breast cancer in the past 2 years',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 62.0,
      benchmark4Star: 72.0,
      benchmark5Star: 82.0,
    },
    {
      measureId: 'CMS131v11',
      measureTitle: 'Diabetes: Eye Exam',
      category: 'QUALITY',
      domain: 'Effective Clinical Care',
      description: 'Percentage of patients 18-75 years of age with diabetes who had a retinal or dilated eye exam',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 42.0,
      benchmark4Star: 55.0,
      benchmark5Star: 68.0,
    },
    {
      measureId: 'CMS127v11',
      measureTitle: 'Pneumococcal Vaccination Status for Older Adults',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of patients 65+ who have ever received a pneumococcal vaccine',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 68.0,
      benchmark4Star: 78.0,
      benchmark5Star: 88.0,
    },
    {
      measureId: 'CMS347v5',
      measureTitle: 'Statin Therapy for Prevention and Treatment of Cardiovascular Disease',
      category: 'QUALITY',
      domain: 'Effective Clinical Care',
      description: 'Percentage of patients at high risk of cardiovascular events who were prescribed or are on statin therapy',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 72.0,
      benchmark4Star: 80.0,
      benchmark5Star: 88.0,
    },
    {
      measureId: 'CMS138v11',
      measureTitle: 'Preventive Care and Screening: Tobacco Use',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of patients aged 18+ who were screened for tobacco use',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 75.0,
      benchmark4Star: 85.0,
      benchmark5Star: 95.0,
    },
    {
      measureId: 'CMS156v11',
      measureTitle: 'Use of High-Risk Medications in Older Adults',
      category: 'QUALITY',
      domain: 'Patient Safety',
      description: 'Percentage of patients 65+ who were ordered at least two of the same high-risk medications',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 18.0,
      benchmark4Star: 12.0,
      benchmark5Star: 6.0,
    },
    {
      measureId: 'CMS50v11',
      measureTitle: 'Closing the Referral Loop: Receipt of Specialist Report',
      category: 'QUALITY',
      domain: 'Communication and Care Coordination',
      description: 'Percentage of patients with referrals who had a report from the specialist received within 30 days',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 50.0,
      benchmark4Star: 65.0,
      benchmark5Star: 80.0,
    },
    {
      measureId: 'CMS134v11',
      measureTitle: 'Diabetes: Medical Attention for Nephropathy',
      category: 'QUALITY',
      domain: 'Effective Clinical Care',
      description: 'Percentage of patients 18-75 with diabetes who had a nephropathy screening test or evidence of nephropathy',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 75.0,
      benchmark4Star: 82.0,
      benchmark5Star: 90.0,
    },
    {
      measureId: 'CMS2v12',
      measureTitle: 'Preventive Care and Screening: Screening for Depression',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of patients aged 12 years and older screened for depression using a standardized tool',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 50.0,
      benchmark4Star: 65.0,
      benchmark5Star: 80.0,
    },
    {
      measureId: 'CMS69v11',
      measureTitle: 'Preventive Care and Screening: BMI Screening and Follow-Up',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of patients aged 18+ with a BMI documented and follow-up plan if BMI is outside parameters',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 60.0,
      benchmark4Star: 72.0,
      benchmark5Star: 85.0,
    },
    {
      measureId: 'CMS139v11',
      measureTitle: 'Falls: Screening for Future Fall Risk',
      category: 'QUALITY',
      domain: 'Patient Safety',
      description: 'Percentage of patients 65 years of age and older who were screened for future fall risk',
      highPriority: false,
      measurePoints: 10,
      benchmark3Star: 55.0,
      benchmark4Star: 70.0,
      benchmark5Star: 85.0,
    },
    {
      measureId: 'CMS117v11',
      measureTitle: 'Childhood Immunization Status',
      category: 'QUALITY',
      domain: 'Community/Population Health',
      description: 'Percentage of children 2 years of age who had required immunizations by their second birthday',
      highPriority: true,
      measurePoints: 10,
      benchmark3Star: 60.0,
      benchmark4Star: 72.0,
      benchmark5Star: 85.0,
    },
  ]

  const createdMeasures: string[] = []
  for (const measure of qualityMeasures) {
    const created = await prisma.qualityMeasure.create({
      data: measure,
    })
    createdMeasures.push(created.id)
  }
  console.log('Created quality measures')

  // Create Patient Quality Measures
  const currentYear = new Date().getFullYear()
  const performanceStart = new Date(currentYear, 0, 1)
  const performanceEnd = new Date(currentYear, 11, 31)

  for (let i = 0; i < createdPatients.length; i++) {
    const patientId = createdPatients[i]
    // Each patient gets 3-4 measures assigned
    const numMeasures = 3 + (i % 2)

    for (let j = 0; j < numMeasures; j++) {
      const measureId = createdMeasures[(i + j) % createdMeasures.length]
      const inDenominator = true
      const inNumerator = (i + j) % 4 !== 0 // 75% in numerator
      const isExcluded = (i + j) % 10 === 0 // 10% excluded

      await prisma.patientQualityMeasure.create({
        data: {
          measureId: measureId,
          patientId: patientId,
          providerId: providers[i % providers.length].id,
          performanceYear: currentYear,
          performanceStart: performanceStart,
          performanceEnd: performanceEnd,
          inDenominator: inDenominator,
          inNumerator: isExcluded ? false : inNumerator,
          isExcluded: isExcluded,
          measureDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
          measureValue: inNumerator ? 'Met' : 'Not Met',
          autoCalculated: true,
          lastCalculatedAt: new Date(),
          encounterId: patientEncounters[patientId]?.[0] || null,
        },
      })
    }
  }
  console.log('Created patient quality measures')

  // Create MIPS Submission record
  await prisma.mIPSSubmission.deleteMany({})

  await prisma.mIPSSubmission.create({
    data: {
      submissionYear: currentYear,
      submissionType: 'INDIVIDUAL',
      qualityScore: 78.5,
      piScore: 85.0,
      iaScore: 40.0,
      costScore: 72.0,
      finalScore: 71.8,
      status: 'DRAFT',
    },
  })
  console.log('Created MIPS submission')

  // Create Patient Consents (multiple types across patients)
  await prisma.patientConsent.deleteMany({})

  const consentTypes = [
    ConsentType.HIPAA_NOTICE,
    ConsentType.TREATMENT_CONSENT,
    ConsentType.FINANCIAL_RESPONSIBILITY,
    ConsentType.TELEHEALTH_CONSENT,
  ]

  for (let i = 0; i < 20; i++) {
    const patientId = createdPatients[i % createdPatients.length]
    for (let j = 0; j < consentTypes.length; j++) {
      const signedDate = new Date()
      signedDate.setDate(signedDate.getDate() - Math.floor(Math.random() * 365))

      await prisma.patientConsent.create({
        data: {
          patientId,
          type: consentTypes[j],
          status: i % 8 === 0 ? 'revoked' : 'signed',
          signedDate,
          expiresDate: new Date(signedDate.getTime() + 365 * 24 * 60 * 60 * 1000),
          ipAddress: `192.168.1.${100 + i}`,
        },
      })
    }
  }
  console.log('Created patient consents')

  // Create Prior Authorizations (16 records)
  await prisma.priorAuthorization.deleteMany({})

  const priorAuthStatuses: PriorAuthStatus[] = [
    PriorAuthStatus.PENDING, PriorAuthStatus.APPROVED, PriorAuthStatus.APPROVED, PriorAuthStatus.APPROVED,
    PriorAuthStatus.DENIED, PriorAuthStatus.EXPIRED, PriorAuthStatus.IN_REVIEW, PriorAuthStatus.APPROVED,
  ]
  const priorAuthServiceTypes = [
    'Imaging', 'Imaging', 'Physical Therapy', 'Surgical',
    'Cardiology', 'Sleep Medicine', 'Gastroenterology', 'Dermatology',
    'Psychiatry', 'Imaging', 'Neurology', 'Pulmonology',
    'Surgical', 'Pain Management', 'Surgical', 'Cardiology',
  ]
  const priorAuthCptCodes = [
    ['72148'], ['74177'], ['97110', '97140'], ['29881'],
    ['93015'], ['95811'], ['45380'], ['99245'],
    ['90837'], ['73221'], ['95907'], ['94010'],
    ['27130'], ['64483'], ['99245'], ['93784'],
  ]

  for (let i = 0; i < 16; i++) {
    const patientId = createdPatients[i % createdPatients.length]
    const status = priorAuthStatuses[i % priorAuthStatuses.length]
    const requestDate = new Date()
    requestDate.setDate(requestDate.getDate() - (30 + i * 3))

    // Find patient insurance
    const patientIns = await prisma.patientInsurance.findFirst({
      where: { patientId },
    })
    if (!patientIns) continue

    await prisma.priorAuthorization.create({
      data: {
        authNumber: `PA-2024-${String(i + 1).padStart(4, '0')}`,
        status,
        requestDate,
        expirationDate: status === 'APPROVED' ? new Date(requestDate.getTime() + 90 * 24 * 60 * 60 * 1000) : null,
        serviceType: priorAuthServiceTypes[i],
        procedureCodes: priorAuthCptCodes[i],
        diagnosisCodes: [icdCodes[i % icdCodes.length].code],
        quantity: [1, 1, 12, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 3, 1, 1][i],
        approvedUnits: status === 'APPROVED' ? [1, 1, 12, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 3, 1, 1][i] : null,
        denialReason: status === 'DENIED' ? 'Does not meet medical necessity criteria per payer guidelines' : null,
        submissionMethod: ['Fax', 'Portal', 'Phone', 'API'][i % 4],
        submittedAt: requestDate,
        respondedAt: status !== 'PENDING' ? new Date(requestDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        notes: `Prior auth for ${priorAuthServiceTypes[i]} services`,
        patientId,
        providerId: providers[i % Math.min(providers.length, 5)].id,
        insuranceId: patientIns.id,
      },
    })
  }
  console.log('Created prior authorizations')

  // Create Patient Communications (18 records)
  await prisma.patientCommunication.deleteMany({})

  const commTypes: CommunicationType[] = [
    CommunicationType.EMAIL, CommunicationType.SMS, CommunicationType.PHONE,
    CommunicationType.LETTER, CommunicationType.PORTAL_MESSAGE,
  ]
  const commSubjects = [
    'Appointment Reminder', 'Lab Results Available', 'Prescription Ready',
    'Annual Physical Due', 'Follow-up Needed', 'Insurance Verification',
    'Balance Notification', 'Referral Update', 'Immunization Reminder',
    'Telehealth Instructions', 'Pre-Visit Checklist', 'Post-Visit Summary',
    'New Patient Welcome', 'Recall Notification', 'Test Results Discussion',
    'Care Plan Update', 'Billing Statement', 'Appointment Confirmation',
  ]

  for (let i = 0; i < 18; i++) {
    const patientId = createdPatients[i % createdPatients.length]
    const commType = commTypes[i % commTypes.length]
    const sentDate = new Date()
    sentDate.setDate(sentDate.getDate() - (18 - i) * 2)

    await prisma.patientCommunication.create({
      data: {
        patientId,
        type: commType,
        direction: i % 4 === 0 ? 'inbound' : 'outbound',
        subject: commSubjects[i],
        message: `Dear ${patients[i % patients.length].firstName}, ${commSubjects[i].toLowerCase()} - please contact our office if you have any questions.`,
        status: i % 6 === 0 ? 'failed' : 'sent',
        sentAt: sentDate,
      },
    })
  }
  console.log('Created patient communications')

  // Create Audit Logs (20 records)
  for (let i = 0; i < 20; i++) {
    const auditDate = new Date()
    auditDate.setDate(auditDate.getDate() - i)

    const actions = [
      'LOGIN', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT',
      'LOGIN', 'READ', 'READ', 'UPDATE', 'CREATE', 'READ',
      'LOGIN', 'UPDATE', 'READ', 'CREATE', 'READ', 'EXPORT', 'DELETE', 'LOGIN',
    ]
    const entities = [
      'User', 'Patient', 'Patient', 'Appointment', 'Claim', 'AuditLog',
      'User', 'Encounter', 'Patient', 'Patient', 'Claim', 'Patient',
      'User', 'Encounter', 'Patient', 'Appointment', 'Claim', 'Patient', 'Appointment', 'User',
    ]

    await prisma.auditLog.create({
      data: {
        userId: users[i % users.length].id,
        action: actions[i],
        entity: entities[i],
        entityId: i < 10 ? createdPatients[i % createdPatients.length] : `entity-${i}`,
        patientId: entities[i] === 'Patient' ? createdPatients[i % createdPatients.length] : null,
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        phiAccessed: entities[i] === 'Patient',
        createdAt: auditDate,
      },
    })
  }
  console.log('Created audit logs')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
