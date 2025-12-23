// Mental Health Screening Tools
// Implements validated screening instruments (PHQ-9, GAD-7, etc.)

export type ScreeningType =
  | 'PHQ9'      // Patient Health Questionnaire-9 (Depression)
  | 'GAD7'      // Generalized Anxiety Disorder-7
  | 'PHQ2'      // Depression quick screen
  | 'GAD2'      // Anxiety quick screen
  | 'AUDIT_C'   // Alcohol Use Disorders Identification Test
  | 'DAST_10'   // Drug Abuse Screening Test
  | 'PCL5'      // PTSD Checklist
  | 'MDQ'       // Mood Disorder Questionnaire (Bipolar)
  | 'CSSRS'     // Columbia Suicide Severity Rating Scale
  | 'EDINBURGH' // Edinburgh Postnatal Depression Scale

export interface ScreeningQuestion {
  id: string
  text: string
  options: Array<{
    value: number
    label: string
  }>
}

export interface ScreeningTemplate {
  type: ScreeningType
  name: string
  description: string
  timeframe: string // e.g., "over the past 2 weeks"
  questions: ScreeningQuestion[]
  scoring: {
    minScore: number
    maxScore: number
    thresholds: Array<{
      min: number
      max: number
      severity: 'NONE' | 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE'
      interpretation: string
      recommendation: string
    }>
  }
  criticalItems?: number[] // Question IDs that require immediate attention if positive
}

// PHQ-9 Depression Screening
export const PHQ9_TEMPLATE: ScreeningTemplate = {
  type: 'PHQ9',
  name: 'Patient Health Questionnaire-9',
  description: 'A validated 9-item instrument for screening, diagnosing, monitoring, and measuring the severity of depression.',
  timeframe: 'Over the last 2 weeks',
  questions: [
    {
      id: 'phq9_1',
      text: 'Little interest or pleasure in doing things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_2',
      text: 'Feeling down, depressed, or hopeless',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_3',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_4',
      text: 'Feeling tired or having little energy',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_5',
      text: 'Poor appetite or overeating',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_6',
      text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_8',
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_9',
      text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 27,
    thresholds: [
      { min: 0, max: 4, severity: 'MINIMAL', interpretation: 'Minimal depression', recommendation: 'Patient may not need depression treatment' },
      { min: 5, max: 9, severity: 'MILD', interpretation: 'Mild depression', recommendation: 'Watchful waiting; repeat PHQ-9 at follow-up' },
      { min: 10, max: 14, severity: 'MODERATE', interpretation: 'Moderate depression', recommendation: 'Treatment plan, considering counseling, follow-up and/or pharmacotherapy' },
      { min: 15, max: 19, severity: 'MODERATELY_SEVERE', interpretation: 'Moderately severe depression', recommendation: 'Active treatment with pharmacotherapy and/or psychotherapy' },
      { min: 20, max: 27, severity: 'SEVERE', interpretation: 'Severe depression', recommendation: 'Immediate initiation of pharmacotherapy and, if severe impairment or poor response to therapy, expedited referral to mental health specialist' }
    ]
  },
  criticalItems: [8] // Question 9 (0-indexed) - suicidal ideation
}

// GAD-7 Anxiety Screening
export const GAD7_TEMPLATE: ScreeningTemplate = {
  type: 'GAD7',
  name: 'Generalized Anxiety Disorder 7-item',
  description: 'A validated 7-item instrument for screening and severity assessment of generalized anxiety disorder.',
  timeframe: 'Over the last 2 weeks',
  questions: [
    {
      id: 'gad7_1',
      text: 'Feeling nervous, anxious, or on edge',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_2',
      text: 'Not being able to stop or control worrying',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_3',
      text: 'Worrying too much about different things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_4',
      text: 'Trouble relaxing',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_5',
      text: 'Being so restless that it is hard to sit still',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_6',
      text: 'Becoming easily annoyed or irritable',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_7',
      text: 'Feeling afraid, as if something awful might happen',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 21,
    thresholds: [
      { min: 0, max: 4, severity: 'MINIMAL', interpretation: 'Minimal anxiety', recommendation: 'Monitor; no treatment needed' },
      { min: 5, max: 9, severity: 'MILD', interpretation: 'Mild anxiety', recommendation: 'Watchful waiting; repeat GAD-7 at follow-up' },
      { min: 10, max: 14, severity: 'MODERATE', interpretation: 'Moderate anxiety', recommendation: 'Probable diagnosis of anxiety disorder; consider treatment' },
      { min: 15, max: 21, severity: 'SEVERE', interpretation: 'Severe anxiety', recommendation: 'Active treatment warranted; consider referral to mental health specialist' }
    ]
  }
}

// PHQ-2 Quick Depression Screen
export const PHQ2_TEMPLATE: ScreeningTemplate = {
  type: 'PHQ2',
  name: 'Patient Health Questionnaire-2',
  description: 'A 2-item quick screen for depression. Positive screen (≥3) indicates need for full PHQ-9.',
  timeframe: 'Over the last 2 weeks',
  questions: [
    {
      id: 'phq2_1',
      text: 'Little interest or pleasure in doing things',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq2_2',
      text: 'Feeling down, depressed, or hopeless',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 6,
    thresholds: [
      { min: 0, max: 2, severity: 'MINIMAL', interpretation: 'Negative screen', recommendation: 'Depression unlikely; rescreening not necessary at this time' },
      { min: 3, max: 6, severity: 'MODERATE', interpretation: 'Positive screen', recommendation: 'Administer PHQ-9 for complete assessment' }
    ]
  }
}

// AUDIT-C Alcohol Screening
export const AUDIT_C_TEMPLATE: ScreeningTemplate = {
  type: 'AUDIT_C',
  name: 'Alcohol Use Disorders Identification Test - Consumption',
  description: 'A 3-item alcohol screening questionnaire to identify hazardous drinking or active alcohol use disorders.',
  timeframe: 'Current drinking patterns',
  questions: [
    {
      id: 'audit_c_1',
      text: 'How often do you have a drink containing alcohol?',
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Monthly or less' },
        { value: 2, label: '2-4 times a month' },
        { value: 3, label: '2-3 times a week' },
        { value: 4, label: '4 or more times a week' }
      ]
    },
    {
      id: 'audit_c_2',
      text: 'How many drinks containing alcohol do you have on a typical day when you are drinking?',
      options: [
        { value: 0, label: '1 or 2' },
        { value: 1, label: '3 or 4' },
        { value: 2, label: '5 or 6' },
        { value: 3, label: '7 to 9' },
        { value: 4, label: '10 or more' }
      ]
    },
    {
      id: 'audit_c_3',
      text: 'How often do you have 6 or more drinks on one occasion?',
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Less than monthly' },
        { value: 2, label: 'Monthly' },
        { value: 3, label: 'Weekly' },
        { value: 4, label: 'Daily or almost daily' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 12,
    thresholds: [
      { min: 0, max: 2, severity: 'MINIMAL', interpretation: 'Low risk (men) / Negative (women)', recommendation: 'Reinforce healthy habits' },
      { min: 3, max: 3, severity: 'MILD', interpretation: 'Low risk (men) / At risk (women)', recommendation: 'Brief intervention for women; monitor men' },
      { min: 4, max: 7, severity: 'MODERATE', interpretation: 'At-risk drinking', recommendation: 'Brief intervention; consider full AUDIT' },
      { min: 8, max: 12, severity: 'SEVERE', interpretation: 'High-risk drinking', recommendation: 'Further assessment needed; consider referral' }
    ]
  }
}

// Screening result interface
export interface ScreeningResult {
  type: ScreeningType
  totalScore: number
  maxScore: number
  severity: string
  interpretation: string
  recommendation: string
  responses: Array<{
    questionId: string
    questionText: string
    response: number
    responseLabel: string
  }>
  criticalAlerts: string[]
  completedAt: Date
}

// Score a screening
export function scoreScreening(
  template: ScreeningTemplate,
  responses: Record<string, number>
): ScreeningResult {
  let totalScore = 0
  const criticalAlerts: string[] = []
  const responseDetails: ScreeningResult['responses'] = []

  template.questions.forEach((question, index) => {
    const response = responses[question.id] || 0
    totalScore += response

    const option = question.options.find(o => o.value === response)
    responseDetails.push({
      questionId: question.id,
      questionText: question.text,
      response,
      responseLabel: option?.label || 'Unknown'
    })

    // Check critical items
    if (template.criticalItems?.includes(index) && response > 0) {
      criticalAlerts.push(`CRITICAL: Positive response to "${question.text}" - requires immediate assessment`)
    }
  })

  // Determine severity based on score
  const threshold = template.scoring.thresholds.find(
    t => totalScore >= t.min && totalScore <= t.max
  ) || template.scoring.thresholds[template.scoring.thresholds.length - 1]

  return {
    type: template.type,
    totalScore,
    maxScore: template.scoring.maxScore,
    severity: threshold.severity,
    interpretation: threshold.interpretation,
    recommendation: threshold.recommendation,
    responses: responseDetails,
    criticalAlerts,
    completedAt: new Date()
  }
}

// Get screening template by type
export function getScreeningTemplate(type: ScreeningType): ScreeningTemplate | null {
  const templates: Record<ScreeningType, ScreeningTemplate> = {
    PHQ9: PHQ9_TEMPLATE,
    GAD7: GAD7_TEMPLATE,
    PHQ2: PHQ2_TEMPLATE,
    GAD2: {
      type: 'GAD2',
      name: 'Generalized Anxiety Disorder 2-item',
      description: 'A 2-item quick screen for anxiety.',
      timeframe: 'Over the last 2 weeks',
      questions: GAD7_TEMPLATE.questions.slice(0, 2),
      scoring: {
        minScore: 0,
        maxScore: 6,
        thresholds: [
          { min: 0, max: 2, severity: 'MINIMAL', interpretation: 'Negative screen', recommendation: 'Anxiety unlikely' },
          { min: 3, max: 6, severity: 'MODERATE', interpretation: 'Positive screen', recommendation: 'Administer GAD-7' }
        ]
      }
    },
    AUDIT_C: AUDIT_C_TEMPLATE,
    DAST_10: createDASTTemplate(),
    PCL5: createPCL5Template(),
    MDQ: createMDQTemplate(),
    CSSRS: createCSSRSTemplate(),
    EDINBURGH: createEdinburghTemplate()
  }

  return templates[type] || null
}

// Get all available screening types
export function getAvailableScreenings(): Array<{
  type: ScreeningType
  name: string
  description: string
  questionCount: number
  estimatedTime: string
}> {
  return [
    { type: 'PHQ2', name: 'PHQ-2', description: 'Quick depression screen', questionCount: 2, estimatedTime: '< 1 min' },
    { type: 'PHQ9', name: 'PHQ-9', description: 'Depression screening', questionCount: 9, estimatedTime: '2-3 min' },
    { type: 'GAD2', name: 'GAD-2', description: 'Quick anxiety screen', questionCount: 2, estimatedTime: '< 1 min' },
    { type: 'GAD7', name: 'GAD-7', description: 'Anxiety screening', questionCount: 7, estimatedTime: '2 min' },
    { type: 'AUDIT_C', name: 'AUDIT-C', description: 'Alcohol use screening', questionCount: 3, estimatedTime: '1 min' },
    { type: 'DAST_10', name: 'DAST-10', description: 'Drug abuse screening', questionCount: 10, estimatedTime: '3 min' },
    { type: 'PCL5', name: 'PCL-5', description: 'PTSD screening', questionCount: 20, estimatedTime: '5-10 min' },
    { type: 'MDQ', name: 'MDQ', description: 'Bipolar disorder screening', questionCount: 15, estimatedTime: '5 min' },
    { type: 'CSSRS', name: 'C-SSRS', description: 'Suicide risk assessment', questionCount: 6, estimatedTime: '2-3 min' },
    { type: 'EDINBURGH', name: 'EPDS', description: 'Postpartum depression', questionCount: 10, estimatedTime: '3 min' }
  ]
}

// Helper functions to create other templates
function createDASTTemplate(): ScreeningTemplate {
  return {
    type: 'DAST_10',
    name: 'Drug Abuse Screening Test-10',
    description: '10-item screening for drug use problems',
    timeframe: 'In the past 12 months',
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `dast_${i + 1}`,
      text: `DAST Question ${i + 1}`,
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' }
      ]
    })),
    scoring: {
      minScore: 0,
      maxScore: 10,
      thresholds: [
        { min: 0, max: 0, severity: 'NONE', interpretation: 'No problems reported', recommendation: 'None' },
        { min: 1, max: 2, severity: 'MILD', interpretation: 'Low level', recommendation: 'Monitor' },
        { min: 3, max: 5, severity: 'MODERATE', interpretation: 'Moderate level', recommendation: 'Further investigation' },
        { min: 6, max: 8, severity: 'MODERATELY_SEVERE', interpretation: 'Substantial level', recommendation: 'Intensive assessment' },
        { min: 9, max: 10, severity: 'SEVERE', interpretation: 'Severe level', recommendation: 'Intensive assessment and treatment' }
      ]
    }
  }
}

function createPCL5Template(): ScreeningTemplate {
  return {
    type: 'PCL5',
    name: 'PTSD Checklist for DSM-5',
    description: '20-item self-report measure of PTSD symptoms',
    timeframe: 'In the past month',
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `pcl5_${i + 1}`,
      text: `PCL-5 Question ${i + 1}`,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]
    })),
    scoring: {
      minScore: 0,
      maxScore: 80,
      thresholds: [
        { min: 0, max: 30, severity: 'MINIMAL', interpretation: 'Below threshold', recommendation: 'Monitor' },
        { min: 31, max: 32, severity: 'MILD', interpretation: 'Borderline', recommendation: 'Consider further assessment' },
        { min: 33, max: 80, severity: 'MODERATE', interpretation: 'Probable PTSD', recommendation: 'Full clinical assessment recommended' }
      ]
    }
  }
}

function createMDQTemplate(): ScreeningTemplate {
  return {
    type: 'MDQ',
    name: 'Mood Disorder Questionnaire',
    description: 'Screening instrument for bipolar spectrum disorders',
    timeframe: 'Has there ever been a period of time when...',
    questions: Array.from({ length: 13 }, (_, i) => ({
      id: `mdq_${i + 1}`,
      text: `MDQ Question ${i + 1}`,
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' }
      ]
    })),
    scoring: {
      minScore: 0,
      maxScore: 13,
      thresholds: [
        { min: 0, max: 6, severity: 'MINIMAL', interpretation: 'Negative screen', recommendation: 'Bipolar disorder unlikely' },
        { min: 7, max: 13, severity: 'MODERATE', interpretation: 'Positive screen', recommendation: 'Further psychiatric evaluation recommended' }
      ]
    }
  }
}

function createCSSRSTemplate(): ScreeningTemplate {
  return {
    type: 'CSSRS',
    name: 'Columbia Suicide Severity Rating Scale',
    description: 'Evidence-supported suicide risk screening',
    timeframe: 'Past month and lifetime',
    questions: [
      {
        id: 'cssrs_1',
        text: 'Have you wished you were dead or wished you could go to sleep and not wake up?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      },
      {
        id: 'cssrs_2',
        text: 'Have you actually had any thoughts of killing yourself?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      },
      {
        id: 'cssrs_3',
        text: 'Have you been thinking about how you might do this?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      },
      {
        id: 'cssrs_4',
        text: 'Have you had these thoughts and had some intention of acting on them?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      },
      {
        id: 'cssrs_5',
        text: 'Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      },
      {
        id: 'cssrs_6',
        text: 'Have you ever done anything, started to do anything, or prepared to do anything to end your life?',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]
      }
    ],
    scoring: {
      minScore: 0,
      maxScore: 6,
      thresholds: [
        { min: 0, max: 0, severity: 'NONE', interpretation: 'No identified risk', recommendation: 'Standard care' },
        { min: 1, max: 2, severity: 'MILD', interpretation: 'Low risk', recommendation: 'Brief intervention; safety planning' },
        { min: 3, max: 4, severity: 'MODERATE', interpretation: 'Moderate risk', recommendation: 'Mental health referral; safety planning' },
        { min: 5, max: 6, severity: 'SEVERE', interpretation: 'High risk', recommendation: 'Immediate psychiatric evaluation; do not leave patient alone' }
      ]
    },
    criticalItems: [1, 2, 3, 4, 5] // All suicidal ideation questions
  }
}

function createEdinburghTemplate(): ScreeningTemplate {
  return {
    type: 'EDINBURGH',
    name: 'Edinburgh Postnatal Depression Scale',
    description: '10-item questionnaire to identify women at risk for perinatal depression',
    timeframe: 'In the past 7 days',
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `epds_${i + 1}`,
      text: `EPDS Question ${i + 1}`,
      options: [
        { value: 0, label: 'Response 0' },
        { value: 1, label: 'Response 1' },
        { value: 2, label: 'Response 2' },
        { value: 3, label: 'Response 3' }
      ]
    })),
    scoring: {
      minScore: 0,
      maxScore: 30,
      thresholds: [
        { min: 0, max: 8, severity: 'MINIMAL', interpretation: 'Depression not likely', recommendation: 'Continue routine screening' },
        { min: 9, max: 11, severity: 'MILD', interpretation: 'Possible depression', recommendation: 'Rescreen in 2-4 weeks; provide resources' },
        { min: 12, max: 12, severity: 'MODERATE', interpretation: 'Fairly high possibility', recommendation: 'Diagnostic assessment indicated' },
        { min: 13, max: 30, severity: 'SEVERE', interpretation: 'Probable depression', recommendation: 'Diagnostic assessment and treatment planning' }
      ]
    },
    criticalItems: [9] // Question 10 (0-indexed) - self-harm thoughts
  }
}
