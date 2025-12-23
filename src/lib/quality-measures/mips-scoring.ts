import { MeasureResult } from './calculator'

export interface MIPSScoreResult {
  performanceYear: number
  qualityScore: number
  qualityWeight: number
  piScore: number
  piWeight: number
  iaScore: number
  iaWeight: number
  costScore: number
  costWeight: number
  finalScore: number
  paymentAdjustment: number
  qualityMeasures: MeasureResult[]
  piAttestations: PIAttestation[]
  iaAttestations: IAAttestation[]
}

export interface PIAttestation {
  measureId: string
  measureTitle: string
  numerator?: number
  denominator?: number
  performanceRate?: number
  attested: boolean
  points: number
}

export interface IAAttestation {
  measureId: string
  measureTitle: string
  weight: 'HIGH' | 'MEDIUM'
  attested: boolean
  points: number
}

// MIPS category weights for 2024
const CATEGORY_WEIGHTS = {
  QUALITY: 30,
  PI: 25,
  IA: 15,
  COST: 30,
}

/**
 * Calculate overall MIPS score
 */
export function calculateMIPSScore(
  qualityMeasures: MeasureResult[],
  piAttestations: PIAttestation[],
  iaAttestations: IAAttestation[],
  costScore: number = 0, // Calculated by CMS
  performanceYear: number
): MIPSScoreResult {
  // Calculate Quality Category Score (max 100 points)
  const qualityScore = calculateQualityScore(qualityMeasures)

  // Calculate PI Category Score (max 100 points)
  const piScore = calculatePIScore(piAttestations)

  // Calculate IA Category Score (max 40 points, scaled to 100)
  const iaScore = calculateIAScore(iaAttestations)

  // Calculate weighted final score
  const finalScore =
    qualityScore * (CATEGORY_WEIGHTS.QUALITY / 100) +
    piScore * (CATEGORY_WEIGHTS.PI / 100) +
    iaScore * (CATEGORY_WEIGHTS.IA / 100) +
    costScore * (CATEGORY_WEIGHTS.COST / 100)

  // Calculate payment adjustment
  const paymentAdjustment = calculatePaymentAdjustment(finalScore, performanceYear)

  return {
    performanceYear,
    qualityScore,
    qualityWeight: CATEGORY_WEIGHTS.QUALITY,
    piScore,
    piWeight: CATEGORY_WEIGHTS.PI,
    iaScore,
    iaWeight: CATEGORY_WEIGHTS.IA,
    costScore,
    costWeight: CATEGORY_WEIGHTS.COST,
    finalScore,
    paymentAdjustment,
    qualityMeasures,
    piAttestations,
    iaAttestations,
  }
}

/**
 * Calculate Quality Category Score
 */
function calculateQualityScore(measures: MeasureResult[]): number {
  if (measures.length === 0) return 0

  // Calculate points for each measure based on performance
  let totalPoints = 0
  let possiblePoints = 0

  for (const measure of measures) {
    const measurePoints = getMeasurePoints(measure)
    totalPoints += measurePoints.earned
    possiblePoints += measurePoints.possible
  }

  // Quality score is percentage of possible points
  return possiblePoints > 0 ? (totalPoints / possiblePoints) * 100 : 0
}

/**
 * Get points for a measure based on performance
 */
function getMeasurePoints(measure: MeasureResult): {
  earned: number
  possible: number
} {
  const possible = 10 // Each measure is worth up to 10 points

  // Decile-based scoring
  let earned = 0
  if (measure.starRating >= 5) {
    earned = 10
  } else if (measure.starRating >= 4) {
    earned = 7
  } else if (measure.starRating >= 3) {
    earned = 5
  } else if (measure.denominator > 0) {
    earned = 3 // Participation points
  }

  return { earned, possible }
}

/**
 * Calculate PI Category Score
 */
function calculatePIScore(attestations: PIAttestation[]): number {
  // Base score from attestations
  let totalPoints = 0

  // Security Risk Analysis is required
  const securityRisk = attestations.find((a) => a.measureId === 'PI_SECURITY')
  if (!securityRisk?.attested) {
    return 0 // Fails PI if security not attested
  }

  for (const attestation of attestations) {
    totalPoints += attestation.points
  }

  // Cap at 100
  return Math.min(totalPoints, 100)
}

/**
 * Calculate IA Category Score
 */
function calculateIAScore(attestations: IAAttestation[]): number {
  // Need 40 points to get full credit
  // High weight = 20 points, Medium weight = 10 points
  let totalPoints = 0

  for (const attestation of attestations) {
    if (attestation.attested) {
      totalPoints += attestation.points
    }
  }

  // Scale to 100 (40 points = 100%)
  return Math.min((totalPoints / 40) * 100, 100)
}

/**
 * Calculate payment adjustment based on final score
 */
function calculatePaymentAdjustment(
  finalScore: number,
  performanceYear: number
): number {
  // Payment adjustments for 2024 performance year (2026 payment year)
  // These thresholds change each year

  // Performance threshold (avoiding negative adjustment)
  const performanceThreshold = 75

  // Exceptional performance bonus threshold
  const exceptionalThreshold = 89.69

  // Maximum negative adjustment
  const maxNegative = -9.0

  // Maximum positive adjustment (exceptional performance bonus)
  const maxPositive = 4.0

  if (finalScore < performanceThreshold) {
    // Negative adjustment scaled linearly
    const shortfall = performanceThreshold - finalScore
    return Math.max((shortfall / performanceThreshold) * maxNegative, maxNegative)
  } else if (finalScore >= exceptionalThreshold) {
    // Exceptional performance bonus
    const excess = finalScore - exceptionalThreshold
    const bonusRange = 100 - exceptionalThreshold
    return Math.min((excess / bonusRange) * maxPositive, maxPositive)
  }

  // Neutral zone - no adjustment
  return 0
}

/**
 * Get IA points for weight
 */
export function getIAPoints(weight: 'HIGH' | 'MEDIUM'): number {
  return weight === 'HIGH' ? 20 : 10
}

/**
 * Generate MIPS submission report
 */
export function generateMIPSReport(scoreResult: MIPSScoreResult): string {
  const lines: string[] = []

  lines.push(`MIPS Performance Report - ${scoreResult.performanceYear}`)
  lines.push('='.repeat(50))
  lines.push('')

  lines.push(`Final MIPS Score: ${scoreResult.finalScore.toFixed(2)} / 100`)
  lines.push(`Payment Adjustment: ${scoreResult.paymentAdjustment >= 0 ? '+' : ''}${scoreResult.paymentAdjustment.toFixed(2)}%`)
  lines.push('')

  lines.push('Category Scores:')
  lines.push('-'.repeat(30))
  lines.push(`Quality (${scoreResult.qualityWeight}%): ${scoreResult.qualityScore.toFixed(2)}`)
  lines.push(`Promoting Interoperability (${scoreResult.piWeight}%): ${scoreResult.piScore.toFixed(2)}`)
  lines.push(`Improvement Activities (${scoreResult.iaWeight}%): ${scoreResult.iaScore.toFixed(2)}`)
  lines.push(`Cost (${scoreResult.costWeight}%): ${scoreResult.costScore.toFixed(2)}`)
  lines.push('')

  lines.push('Quality Measures:')
  lines.push('-'.repeat(30))
  for (const measure of scoreResult.qualityMeasures) {
    lines.push(`${measure.measureId}: ${measure.performanceRate.toFixed(1)}% (${measure.starRating} stars)`)
    lines.push(`  Numerator: ${measure.numerator} / Denominator: ${measure.denominator}`)
    lines.push(`  Gap Patients: ${measure.gapPatients.length}`)
  }

  return lines.join('\n')
}
