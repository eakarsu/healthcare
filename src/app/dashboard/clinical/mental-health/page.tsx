'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Brain, AlertTriangle, CheckCircle, ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react'

interface ScreeningQuestion {
  id: string
  text: string
  options: Array<{ value: number; label: string }>
}

interface ScreeningResult {
  totalScore: number
  maxScore: number
  severity: string
  interpretation: string
  recommendation: string
  criticalAlerts: string[]
}

const PHQ9_QUESTIONS: ScreeningQuestion[] = [
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
    text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
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
]

const SCREENING_TYPES = [
  { type: 'PHQ9', name: 'PHQ-9', description: 'Depression Screening', duration: '2-3 min', questions: 9 },
  { type: 'GAD7', name: 'GAD-7', description: 'Anxiety Screening', duration: '2 min', questions: 7 },
  { type: 'PHQ2', name: 'PHQ-2', description: 'Depression Quick Screen', duration: '< 1 min', questions: 2 },
  { type: 'AUDIT_C', name: 'AUDIT-C', description: 'Alcohol Use Screening', duration: '1 min', questions: 3 },
  { type: 'CSSRS', name: 'C-SSRS', description: 'Suicide Risk Assessment', duration: '2-3 min', questions: 6 }
]

export default function MentalHealthPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [providerNotes, setProviderNotes] = useState('')
  const [isAdministering, setIsAdministering] = useState(false)

  const questions = selectedType === 'PHQ9' ? PHQ9_QUESTIONS : []
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  const handleStartScreening = () => {
    if (!selectedType || !selectedPatient) return
    setIsAdministering(true)
    setCurrentQuestion(0)
    setResponses({})
    setResult(null)
  }

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Calculate score
    const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0)

    // Determine severity
    let severity = 'MINIMAL'
    let interpretation = ''
    let recommendation = ''

    if (totalScore >= 20) {
      severity = 'SEVERE'
      interpretation = 'Severe depression'
      recommendation = 'Immediate initiation of pharmacotherapy and, if severe impairment or poor response to therapy, expedited referral to mental health specialist'
    } else if (totalScore >= 15) {
      severity = 'MODERATELY_SEVERE'
      interpretation = 'Moderately severe depression'
      recommendation = 'Active treatment with pharmacotherapy and/or psychotherapy'
    } else if (totalScore >= 10) {
      severity = 'MODERATE'
      interpretation = 'Moderate depression'
      recommendation = 'Treatment plan, considering counseling, follow-up and/or pharmacotherapy'
    } else if (totalScore >= 5) {
      severity = 'MILD'
      interpretation = 'Mild depression'
      recommendation = 'Watchful waiting; repeat PHQ-9 at follow-up'
    } else {
      severity = 'MINIMAL'
      interpretation = 'Minimal depression'
      recommendation = 'Patient may not need depression treatment'
    }

    // Check for critical item (question 9 - suicidal ideation)
    const criticalAlerts: string[] = []
    if (responses['phq9_9'] && responses['phq9_9'] > 0) {
      criticalAlerts.push('CRITICAL: Positive response to suicidal ideation question - requires immediate safety assessment')
    }

    setResult({
      totalScore,
      maxScore: 27,
      severity,
      interpretation,
      recommendation,
      criticalAlerts
    })

    setIsAdministering(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'MINIMAL': return 'bg-green-100 text-green-800'
      case 'MILD': return 'bg-yellow-100 text-yellow-800'
      case 'MODERATE': return 'bg-orange-100 text-orange-800'
      case 'MODERATELY_SEVERE': return 'bg-red-100 text-red-800'
      case 'SEVERE': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mental Health Screening</h1>
        <p className="text-muted-foreground">
          Administer validated screening instruments for mental health assessment
        </p>
      </div>

      {!isAdministering && !result && (
        <>
          {/* Screening Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Select Screening Type
              </CardTitle>
              <CardDescription>
                Choose from validated mental health screening instruments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCREENING_TYPES.map(screen => (
                  <div
                    key={screen.type}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedType === screen.type
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                      }`}
                    onClick={() => setSelectedType(screen.type)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{screen.name}</h3>
                        <p className="text-sm text-muted-foreground">{screen.description}</p>
                      </div>
                      {selectedType === screen.type && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{screen.questions} questions</Badge>
                      <Badge variant="outline">{screen.duration}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient-1">John Smith (MRN: 001)</SelectItem>
                      <SelectItem value="patient-2">Jane Doe (MRN: 002)</SelectItem>
                      <SelectItem value="patient-3">Robert Johnson (MRN: 003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStartScreening}
                  disabled={!selectedType || !selectedPatient}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Screening
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Screening Administration */}
      {isAdministering && questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>PHQ-9 Screening</CardTitle>
                <CardDescription>
                  Over the last 2 weeks, how often have you been bothered by the following?
                </CardDescription>
              </div>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-4">
              <h3 className="text-lg font-medium mb-4">
                {questions[currentQuestion].text}
              </h3>
              <RadioGroup
                value={responses[questions[currentQuestion].id]?.toString()}
                onValueChange={(value) => handleResponse(questions[currentQuestion].id, parseInt(value))}
              >
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                      <Label htmlFor={`option-${option.value}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Warning for critical question */}
            {questions[currentQuestion].id === 'phq9_9' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Critical Safety Question</p>
                    <p className="text-sm text-yellow-700">
                      Any positive response to this question requires immediate safety assessment and appropriate intervention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={responses[questions[currentQuestion].id] === undefined}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(responses).length < questions.length}
                >
                  Submit Screening
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Screening Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Critical Alerts */}
              {result.criticalAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  {result.criticalAlerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p className="font-medium">{alert}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-4xl font-bold">{result.totalScore}</div>
                  <div className="text-sm text-muted-foreground">out of {result.maxScore}</div>
                  <div className="text-sm font-medium mt-2">Total Score</div>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <Badge className={`${getSeverityColor(result.severity)} mb-2`}>
                    {result.severity.replace('_', ' ')}
                  </Badge>
                  <p className="font-medium">{result.interpretation}</p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add clinical notes, observations, and follow-up plan..."
                value={providerNotes}
                onChange={(e) => setProviderNotes(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setResult(null)
                  setSelectedType(null)
                }}>
                  New Screening
                </Button>
                <Button>
                  Save to Chart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
