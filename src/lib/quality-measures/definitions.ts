/**
 * CMS Quality Measure Definitions
 * These are common MIPS quality measures for primary care
 */

export interface MeasureDefinition {
  measureId: string
  measureTitle: string
  description: string
  category: 'QUALITY' | 'PI' | 'IA' | 'COST'
  domain: string
  numeratorDescription: string
  denominatorDescription: string
  exclusionDescription?: string
  highPriority: boolean
  measurePoints: number
  benchmark3Star: number
  benchmark4Star: number
  benchmark5Star: number
  applicableSpecialties: string[]
  icdCodes?: string[] // Diagnosis codes that qualify for denominator
  cptCodes?: string[] // Procedure codes that qualify for denominator
  ageRange?: { min: number; max: number }
}

/**
 * Common MIPS Quality Measures for Primary Care
 */
export const QUALITY_MEASURES: MeasureDefinition[] = [
  {
    measureId: 'CMS122v11',
    measureTitle: 'Diabetes: Hemoglobin A1c (HbA1c) Poor Control (>9%)',
    description: 'Percentage of patients 18-75 years of age with diabetes who had hemoglobin A1c > 9.0% during the measurement period.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients whose most recent HbA1c level is > 9.0%',
    denominatorDescription: 'Patients 18-75 years of age with diabetes',
    exclusionDescription: 'Patients with a diagnosis of secondary diabetes, gestational diabetes, or steroid-induced diabetes',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 32,
    benchmark4Star: 22,
    benchmark5Star: 12,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Endocrinology'],
    icdCodes: ['E10', 'E11', 'E13'],
    ageRange: { min: 18, max: 75 },
  },
  {
    measureId: 'CMS165v11',
    measureTitle: 'Controlling High Blood Pressure',
    description: 'Percentage of patients 18-85 years of age who had a diagnosis of hypertension and whose blood pressure was adequately controlled (<140/90 mmHg).',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients whose most recent blood pressure is adequately controlled (<140/90 mmHg)',
    denominatorDescription: 'Patients 18-85 years of age with a diagnosis of essential hypertension',
    exclusionDescription: 'Patients with ESRD, pregnancy, or dialysis',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 58,
    benchmark4Star: 68,
    benchmark5Star: 78,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Cardiology'],
    icdCodes: ['I10'],
    ageRange: { min: 18, max: 85 },
  },
  {
    measureId: 'CMS130v11',
    measureTitle: 'Colorectal Cancer Screening',
    description: 'Percentage of adults 50-75 years of age who had appropriate screening for colorectal cancer.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients with one or more screenings for colorectal cancer',
    denominatorDescription: 'Patients 50-75 years of age',
    exclusionDescription: 'Patients with a diagnosis of colorectal cancer or total colectomy',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 45,
    benchmark4Star: 58,
    benchmark5Star: 72,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Gastroenterology'],
    ageRange: { min: 50, max: 75 },
  },
  {
    measureId: 'CMS125v11',
    measureTitle: 'Breast Cancer Screening',
    description: 'Percentage of women 50-74 years of age who had a mammogram to screen for breast cancer.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Women with one or more mammograms during the measurement period or the 15 months prior',
    denominatorDescription: 'Women 50-74 years of age',
    exclusionDescription: 'Women with bilateral mastectomy or unilateral mastectomy with modifier indicating remaining breast',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 62,
    benchmark4Star: 72,
    benchmark5Star: 82,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'OB/GYN'],
    ageRange: { min: 50, max: 74 },
  },
  {
    measureId: 'CMS131v11',
    measureTitle: 'Diabetes: Eye Exam',
    description: 'Percentage of patients 18-75 years of age with diabetes who had a retinal or dilated eye exam by an eye care professional.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients with a retinal or dilated eye exam during the measurement period',
    denominatorDescription: 'Patients 18-75 years of age with diabetes',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 42,
    benchmark4Star: 55,
    benchmark5Star: 68,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Endocrinology', 'Ophthalmology'],
    icdCodes: ['E10', 'E11', 'E13'],
    ageRange: { min: 18, max: 75 },
  },
  {
    measureId: 'CMS127v11',
    measureTitle: 'Pneumococcal Vaccination Status for Older Adults',
    description: 'Percentage of patients 65 years of age and older who have ever received a pneumococcal vaccine.',
    category: 'QUALITY',
    domain: 'Community/Population Health',
    numeratorDescription: 'Patients who have ever received a pneumococcal vaccine',
    denominatorDescription: 'Patients 65 years of age and older',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 70,
    benchmark4Star: 80,
    benchmark5Star: 90,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Geriatrics'],
    ageRange: { min: 65, max: 999 },
  },
  {
    measureId: 'CMS347v5',
    measureTitle: 'Statin Therapy for Prevention and Treatment of Cardiovascular Disease',
    description: 'Percentage of patients at high risk of cardiovascular events who were prescribed or are on statin therapy.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients who are actively using or were prescribed statin therapy',
    denominatorDescription: 'Patients with clinical ASCVD, LDL ≥190 mg/dL, or diabetes and LDL 70-189 mg/dL',
    exclusionDescription: 'Patients with adverse reactions to statins, pregnancy, breastfeeding, or ESRD',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 72,
    benchmark4Star: 80,
    benchmark5Star: 88,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Cardiology'],
    icdCodes: ['I25', 'I21', 'I63', 'I65', 'I66', 'E78.0'],
  },
  {
    measureId: 'CMS138v11',
    measureTitle: 'Preventive Care and Screening: Tobacco Use',
    description: 'Percentage of patients aged 18 years and older who were screened for tobacco use and received cessation intervention if identified as a user.',
    category: 'QUALITY',
    domain: 'Community/Population Health',
    numeratorDescription: 'Patients screened for tobacco use and received cessation intervention if user',
    denominatorDescription: 'All patients aged 18 years and older',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 80,
    benchmark4Star: 88,
    benchmark5Star: 95,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Pulmonology'],
    ageRange: { min: 18, max: 999 },
  },
  {
    measureId: 'CMS156v11',
    measureTitle: 'Use of High-Risk Medications in Older Adults',
    description: 'Percentage of patients 65 years of age and older who were ordered at least two of the same high-risk medications.',
    category: 'QUALITY',
    domain: 'Patient Safety',
    numeratorDescription: 'Patients who were ordered high-risk medications to avoid (inverse measure - lower is better)',
    denominatorDescription: 'Patients 65 years of age and older',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 18,
    benchmark4Star: 12,
    benchmark5Star: 6,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Geriatrics'],
    ageRange: { min: 65, max: 999 },
  },
  {
    measureId: 'CMS50v11',
    measureTitle: 'Closing the Referral Loop: Receipt of Specialist Report',
    description: 'Percentage of patients with referrals who had a report from the specialist received within 30 days.',
    category: 'QUALITY',
    domain: 'Communication and Care Coordination',
    numeratorDescription: 'Patients with a specialist report received within 30 days of referral',
    denominatorDescription: 'Patients with a referral to another clinician',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 50,
    benchmark4Star: 65,
    benchmark5Star: 80,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine'],
  },
  {
    measureId: 'CMS134v11',
    measureTitle: 'Diabetes: Medical Attention for Nephropathy',
    description: 'Percentage of patients 18-75 years of age with diabetes who had a nephropathy screening test or evidence of nephropathy.',
    category: 'QUALITY',
    domain: 'Effective Clinical Care',
    numeratorDescription: 'Patients with a nephropathy screening test or evidence of nephropathy during the measurement period',
    denominatorDescription: 'Patients 18-75 years of age with diabetes',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 75,
    benchmark4Star: 82,
    benchmark5Star: 90,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Endocrinology', 'Nephrology'],
    icdCodes: ['E10', 'E11', 'E13'],
    ageRange: { min: 18, max: 75 },
  },
  {
    measureId: 'CMS2v12',
    measureTitle: 'Preventive Care and Screening: Screening for Depression',
    description: 'Percentage of patients aged 12 years and older screened for depression using a standardized tool.',
    category: 'QUALITY',
    domain: 'Community/Population Health',
    numeratorDescription: 'Patients screened for depression using a standardized tool with follow-up plan documented',
    denominatorDescription: 'All patients aged 12 years and older',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 50,
    benchmark4Star: 65,
    benchmark5Star: 80,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Psychiatry', 'Pediatrics'],
    ageRange: { min: 12, max: 999 },
  },
  {
    measureId: 'CMS69v11',
    measureTitle: 'Preventive Care and Screening: BMI Screening and Follow-Up',
    description: 'Percentage of patients aged 18 years and older with a BMI documented and follow-up plan if BMI is outside parameters.',
    category: 'QUALITY',
    domain: 'Community/Population Health',
    numeratorDescription: 'Patients with BMI documented and follow-up plan if outside normal parameters',
    denominatorDescription: 'All patients aged 18 years and older',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 60,
    benchmark4Star: 72,
    benchmark5Star: 85,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Endocrinology'],
    ageRange: { min: 18, max: 999 },
  },
  {
    measureId: 'CMS139v11',
    measureTitle: 'Falls: Screening for Future Fall Risk',
    description: 'Percentage of patients 65 years of age and older who were screened for future fall risk.',
    category: 'QUALITY',
    domain: 'Patient Safety',
    numeratorDescription: 'Patients who were screened for fall risk at least once within the measurement period',
    denominatorDescription: 'Patients 65 years of age and older',
    highPriority: false,
    measurePoints: 10,
    benchmark3Star: 55,
    benchmark4Star: 70,
    benchmark5Star: 85,
    applicableSpecialties: ['Family Medicine', 'Internal Medicine', 'Geriatrics'],
    ageRange: { min: 65, max: 999 },
  },
  {
    measureId: 'CMS117v11',
    measureTitle: 'Childhood Immunization Status',
    description: 'Percentage of children 2 years of age who had four DTaP, three IPV, one MMR, and other required immunizations.',
    category: 'QUALITY',
    domain: 'Community/Population Health',
    numeratorDescription: 'Children with all required immunizations by their second birthday',
    denominatorDescription: 'Children who turn 2 years of age during the measurement period',
    highPriority: true,
    measurePoints: 10,
    benchmark3Star: 60,
    benchmark4Star: 72,
    benchmark5Star: 85,
    applicableSpecialties: ['Family Medicine', 'Pediatrics'],
    ageRange: { min: 2, max: 2 },
  },
]

/**
 * Promoting Interoperability (PI) Measures
 */
export const PI_MEASURES = [
  {
    measureId: 'PI_EPRESCRIBE',
    measureTitle: 'e-Prescribing',
    description: 'Prescriptions transmitted electronically using CEHRT',
    category: 'PI',
    required: true,
    basePoints: 10,
    bonusPoints: 5,
    threshold: 0.7, // 70% of prescriptions must be electronic
  },
  {
    measureId: 'PI_HIE',
    measureTitle: 'Health Information Exchange',
    description: 'Electronic summary of care records sent or received',
    category: 'PI',
    required: true,
    basePoints: 20,
    bonusPoints: 10,
    threshold: 0.5,
  },
  {
    measureId: 'PI_SECURITY',
    measureTitle: 'Security Risk Analysis',
    description: 'Conduct or review a security risk analysis',
    category: 'PI',
    required: true,
    attestation: true,
    basePoints: 0,
    bonusPoints: 0,
  },
  {
    measureId: 'PI_REGISTRY',
    measureTitle: 'Public Health Registry Reporting',
    description: 'Report to immunization, syndromic surveillance, or other registries',
    category: 'PI',
    required: false,
    basePoints: 10,
    bonusPoints: 5,
  },
]

/**
 * Improvement Activities (IA) Measures
 */
export const IA_MEASURES = [
  {
    measureId: 'IA_CC_1',
    measureTitle: 'Care Coordination Agreements',
    description: 'Establish care coordination agreements with high volume referral destinations',
    category: 'IA',
    weight: 'MEDIUM',
    attestation: true,
  },
  {
    measureId: 'IA_PSPA_1',
    measureTitle: 'Participation in Annual Safety Culture Survey',
    description: 'Participate in an annual safety culture survey and implement improvements',
    category: 'IA',
    weight: 'MEDIUM',
    attestation: true,
  },
  {
    measureId: 'IA_EPA_1',
    measureTitle: 'Provide 24/7 Patient Access',
    description: 'Provide 24/7 access to clinicians for urgent issues',
    category: 'IA',
    weight: 'HIGH',
    attestation: true,
  },
  {
    measureId: 'IA_BE_1',
    measureTitle: 'Use of Patient Engagement Tools',
    description: 'Use patient engagement tools such as portals or secure messaging',
    category: 'IA',
    weight: 'MEDIUM',
    attestation: true,
  },
  {
    measureId: 'IA_PM_1',
    measureTitle: 'PCMH/APM Participation',
    description: 'Participation in a Patient-Centered Medical Home or Alternative Payment Model',
    category: 'IA',
    weight: 'HIGH',
    attestation: true,
  },
]

/**
 * Get measures applicable to a specialty
 */
export function getMeasuresForSpecialty(specialty: string): MeasureDefinition[] {
  return QUALITY_MEASURES.filter(
    (m) => m.applicableSpecialties.includes(specialty) || m.applicableSpecialties.length === 0
  )
}

/**
 * Get measure by ID
 */
export function getMeasureById(measureId: string): MeasureDefinition | undefined {
  return QUALITY_MEASURES.find((m) => m.measureId === measureId)
}
