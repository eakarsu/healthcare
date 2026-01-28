import { prisma } from '@/lib/prisma'
import { QUALITY_MEASURES, MeasureDefinition } from './definitions'

export interface MeasureResult {
  measureId: string
  measureTitle: string
  numerator: number
  denominator: number
  exclusions: number
  performanceRate: number
  benchmark3Star: number
  benchmark4Star: number
  benchmark5Star: number
  starRating: number
  gapPatients: string[] // Patient IDs who don't meet measure
}

/**
 * Calculate quality measure for a provider
 */
export async function calculateMeasure(
  measureId: string,
  providerId: string,
  performanceYear: number
): Promise<MeasureResult> {
  const measure = QUALITY_MEASURES.find((m) => m.measureId === measureId)
  if (!measure) {
    throw new Error(`Measure ${measureId} not found`)
  }

  const startDate = new Date(performanceYear, 0, 1)
  const endDate = new Date(performanceYear, 11, 31, 23, 59, 59)

  // Get denominator patients
  const denominatorPatients = await getDenominatorPatients(
    measure,
    providerId,
    startDate,
    endDate
  )

  // Get numerator patients
  const numeratorPatients = await getNumeratorPatients(
    measure,
    providerId,
    startDate,
    endDate,
    denominatorPatients
  )

  // Get exclusions
  const excludedPatients = await getExcludedPatients(
    measure,
    denominatorPatients
  )

  // Calculate performance rate
  const effectiveDenominator = denominatorPatients.length - excludedPatients.length
  const performanceRate =
    effectiveDenominator > 0
      ? (numeratorPatients.length / effectiveDenominator) * 100
      : 0

  // Calculate star rating
  const starRating = calculateStarRating(performanceRate, measure)

  // Find gap patients (in denominator but not in numerator)
  const numeratorSet = new Set(numeratorPatients)
  const excludedSet = new Set(excludedPatients)
  const gapPatients = denominatorPatients.filter(
    (p) => !numeratorSet.has(p) && !excludedSet.has(p)
  )

  return {
    measureId: measure.measureId,
    measureTitle: measure.measureTitle,
    numerator: numeratorPatients.length,
    denominator: denominatorPatients.length,
    exclusions: excludedPatients.length,
    performanceRate,
    benchmark3Star: measure.benchmark3Star,
    benchmark4Star: measure.benchmark4Star,
    benchmark5Star: measure.benchmark5Star,
    starRating,
    gapPatients,
  }
}

/**
 * Calculate all measures for a provider
 */
export async function calculateAllMeasures(
  providerId: string,
  performanceYear: number
): Promise<MeasureResult[]> {
  const results: MeasureResult[] = []

  for (const measure of QUALITY_MEASURES) {
    try {
      const result = await calculateMeasure(
        measure.measureId,
        providerId,
        performanceYear
      )
      results.push(result)
    } catch (error) {
      console.error(`Failed to calculate measure ${measure.measureId}:`, error)
    }
  }

  return results
}

/**
 * Get denominator patients for a measure
 */
async function getDenominatorPatients(
  measure: MeasureDefinition,
  providerId: string,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // Build patient filter based on measure criteria
  const patientFilter: Record<string, unknown> = {}

  // Age range filter
  if (measure.ageRange) {
    const today = new Date()
    const minDob = new Date(today)
    minDob.setFullYear(minDob.getFullYear() - measure.ageRange.max)
    const maxDob = new Date(today)
    maxDob.setFullYear(maxDob.getFullYear() - measure.ageRange.min)

    patientFilter.dateOfBirth = {
      gte: minDob,
      lte: maxDob,
    }
  }

  // Get patients seen by provider during performance period
  const encounters = await prisma.encounter.findMany({
    where: {
      providerId,
      encounterDate: { gte: startDate, lte: endDate },
      status: 'SIGNED',
      ...(Object.keys(patientFilter).length > 0 ? { patient: patientFilter } : {}),
    },
    select: { patientId: true },
    distinct: ['patientId'],
  })

  const patientIds = encounters.map((e) => e.patientId)

  // Filter by diagnosis codes if applicable
  if (measure.icdCodes && measure.icdCodes.length > 0) {
    const diagnosisPatients = await prisma.encounterDiagnosis.findMany({
      where: {
        encounter: {
          patientId: { in: patientIds },
          encounterDate: { gte: startDate, lte: endDate },
        },
        icdCode: {
          in: measure.icdCodes.flatMap((code) => [
            code,
            `${code}.0`,
            `${code}.1`,
            `${code}.9`,
          ]),
        },
      },
      select: { encounter: { select: { patientId: true } } },
      distinct: ['encounterId'],
    })

    return [...new Set(diagnosisPatients.map((d) => d.encounter.patientId))]
  }

  return patientIds
}

/**
 * Get numerator patients for a measure
 */
async function getNumeratorPatients(
  measure: MeasureDefinition,
  providerId: string,
  startDate: Date,
  endDate: Date,
  denominatorPatients: string[]
): Promise<string[]> {
  // Measure-specific numerator logic
  switch (measure.measureId) {
    case 'CMS122v11': // Diabetes HbA1c
      return getHbA1cControlledPatients(denominatorPatients, startDate, endDate)

    case 'CMS165v11': // Controlling High Blood Pressure
      return getBPControlledPatients(denominatorPatients, startDate, endDate)

    case 'CMS130v11': // Colorectal Cancer Screening
      return getColorectalScreenedPatients(denominatorPatients, startDate, endDate)

    case 'CMS125v11': // Breast Cancer Screening
      return getBreastCancerScreenedPatients(denominatorPatients, startDate, endDate)

    case 'CMS127v11': // Pneumococcal Vaccination
      return getPneumococcalVaccinatedPatients(denominatorPatients)

    case 'CMS138v11': // Tobacco Screening
      return getTobaccoScreenedPatients(denominatorPatients, startDate, endDate)

    default:
      // Generic numerator - check if patient quality measure record exists
      // First get the QualityMeasure database record ID
      const dbMeasure = await prisma.qualityMeasure.findUnique({
        where: { measureId: measure.measureId },
        select: { id: true },
      })
      if (!dbMeasure) return []

      const records = await prisma.patientQualityMeasure.findMany({
        where: {
          measureId: dbMeasure.id,
          patientId: { in: denominatorPatients },
          performanceYear: startDate.getFullYear(),
          inNumerator: true,
        },
        select: { patientId: true },
      })
      return records.map((r) => r.patientId)
  }
}

/**
 * Get excluded patients for a measure
 */
async function getExcludedPatients(
  measure: MeasureDefinition,
  denominatorPatients: string[]
): Promise<string[]> {
  // First get the QualityMeasure database record ID
  const dbMeasure = await prisma.qualityMeasure.findUnique({
    where: { measureId: measure.measureId },
    select: { id: true },
  })
  if (!dbMeasure) return []

  // Check for exclusion records
  const excluded = await prisma.patientQualityMeasure.findMany({
    where: {
      measureId: dbMeasure.id,
      patientId: { in: denominatorPatients },
      isExcluded: true,
    },
    select: { patientId: true },
  })

  return excluded.map((e) => e.patientId)
}

/**
 * Calculate star rating based on performance rate
 */
function calculateStarRating(
  performanceRate: number,
  measure: MeasureDefinition
): number {
  // Some measures are inverse (lower is better)
  const isInverse = measure.measureId === 'CMS122v11' || measure.measureId === 'CMS156v11'

  if (isInverse) {
    if (performanceRate <= measure.benchmark5Star) return 5
    if (performanceRate <= measure.benchmark4Star) return 4
    if (performanceRate <= measure.benchmark3Star) return 3
    return 2
  } else {
    if (performanceRate >= measure.benchmark5Star) return 5
    if (performanceRate >= measure.benchmark4Star) return 4
    if (performanceRate >= measure.benchmark3Star) return 3
    return 2
  }
}

// Measure-specific numerator calculations

async function getHbA1cControlledPatients(
  patientIds: string[],
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // For this measure, "in control" means HbA1c <= 9% (inverse - we want patients NOT in numerator)
  const labResults = await prisma.labOrder.findMany({
    where: {
      patientId: { in: patientIds },
      resultsReceivedAt: { gte: startDate, lte: endDate },
      testCodes: { hasSome: ['83036', 'HbA1c', 'A1C'] },
    },
    orderBy: { resultsReceivedAt: 'desc' },
    distinct: ['patientId'],
  })

  // This is an inverse measure - return patients with poor control (HbA1c > 9%)
  // For simplicity, we'll check the results JSON field
  return labResults
    .filter((lab) => {
      const results = lab as unknown as { results?: { hba1c?: number } }
      return results.results?.hba1c && results.results.hba1c > 9
    })
    .map((lab) => lab.patientId)
}

async function getBPControlledPatients(
  patientIds: string[],
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // Find patients with most recent BP < 140/90
  const encounters = await prisma.encounter.findMany({
    where: {
      patientId: { in: patientIds },
      encounterDate: { gte: startDate, lte: endDate },
      bloodPressureSystolic: { not: null },
    },
    orderBy: { encounterDate: 'desc' },
    distinct: ['patientId'],
    select: {
      patientId: true,
      bloodPressureSystolic: true,
      bloodPressureDiastolic: true,
    },
  })

  return encounters
    .filter((e) => {
      const systolic = Number(e.bloodPressureSystolic)
      const diastolic = Number(e.bloodPressureDiastolic)
      return systolic < 140 && diastolic < 90
    })
    .map((e) => e.patientId)
}

async function getColorectalScreenedPatients(
  patientIds: string[],
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // Check for colonoscopy in past 10 years or FOBT in past year
  const tenYearsAgo = new Date(startDate)
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)

  const screenings = await prisma.encounterProcedure.findMany({
    where: {
      encounter: {
        patientId: { in: patientIds },
      },
      OR: [
        {
          cptCode: { in: ['45378', '45380', '45381', '45384', '45385'] },
          encounter: {
            encounterDate: { gte: tenYearsAgo },
          },
        },
        {
          cptCode: { in: ['82270', '82274', 'G0328'] },
          encounter: {
            encounterDate: { gte: startDate },
          },
        },
      ],
    },
    select: { encounter: { select: { patientId: true } } },
    distinct: ['encounterId'],
  })

  return [...new Set(screenings.map((s) => s.encounter.patientId))]
}

async function getBreastCancerScreenedPatients(
  patientIds: string[],
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // Check for mammogram in past 27 months (measurement period + 15 months prior)
  const screeningStart = new Date(startDate)
  screeningStart.setMonth(screeningStart.getMonth() - 15)

  const screenings = await prisma.imagingStudy.findMany({
    where: {
      patientId: { in: patientIds },
      modality: { in: ['MAMMOGRAM', 'MG', 'Mammography'] },
      performedDate: { gte: screeningStart, lte: endDate },
    },
    select: { patientId: true },
    distinct: ['patientId'],
  })

  return screenings.map((s) => s.patientId)
}

async function getPneumococcalVaccinatedPatients(
  patientIds: string[]
): Promise<string[]> {
  // Check for pneumococcal vaccine ever
  const vaccinated = await prisma.patient.findMany({
    where: {
      id: { in: patientIds },
      encounters: {
        some: {
          procedures: {
            some: {
              cptCode: { in: ['90670', '90671', '90732'] },
            },
          },
        },
      },
    },
    select: { id: true },
  })

  return vaccinated.map((p) => p.id)
}

async function getTobaccoScreenedPatients(
  patientIds: string[],
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  // Check for tobacco screening via procedure codes or diagnosis codes
  // Tobacco counseling CPT codes: 99406, 99407, G0436, G0437, G9016
  // Tobacco use diagnosis codes: F17.*, Z87.891 (history of nicotine dependence), Z72.0 (tobacco use)
  const screened = await prisma.encounter.findMany({
    where: {
      patientId: { in: patientIds },
      encounterDate: { gte: startDate, lte: endDate },
      OR: [
        {
          procedures: {
            some: {
              cptCode: { in: ['99406', '99407', 'G0436', 'G0437', 'G9016', '1036F'] },
            },
          },
        },
        {
          diagnoses: {
            some: {
              icdCode: { startsWith: 'F17' },
            },
          },
        },
        {
          diagnoses: {
            some: {
              icdCode: { in: ['Z87.891', 'Z72.0'] },
            },
          },
        },
      ],
    },
    select: { patientId: true },
    distinct: ['patientId'],
  })

  return screened.map((e) => e.patientId)
}
