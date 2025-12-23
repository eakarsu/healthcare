'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Stethoscope,
  Search,
  Loader2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Pill,
  Activity,
  FileText,
  Lightbulb,
  User,
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  gender: string
  medications?: Array<{ name: string; dosage: string }>
  allergies?: Array<{ allergen: string }>
  conditions?: Array<{ name: string }>
}

interface TreatmentRecommendation {
  category: string
  recommendations: {
    title: string
    description: string
    evidenceLevel: 'A' | 'B' | 'C'
    source: string
    sourceUrl?: string
  }[]
}

interface RecommendationResult {
  diagnosis: string
  icdCode: string
  guidelines: TreatmentRecommendation[]
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    contraindications: string[]
  }[]
  procedures: string[]
  referrals: string[]
  followUp: string
  warnings: string[]
}

export default function TreatmentRecommendationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [formData, setFormData] = useState({
    diagnosis: '',
    patientAge: '',
    patientGender: '',
    comorbidities: '',
    currentMedications: '',
    allergies: '',
    additionalNotes: '',
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=medications,allergies,conditions&limit=100')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      const age = patient.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : ''
      const medications = patient.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || ''
      const allergies = patient.allergies?.map(a => a.allergen).join(', ') || ''
      const conditions = patient.conditions?.map(c => c.name).join(', ') || ''

      setFormData(prev => ({
        ...prev,
        patientAge: age.toString(),
        patientGender: patient.gender || prev.patientGender,
        currentMedications: medications || prev.currentMedications,
        allergies: allergies || prev.allergies,
        comorbidities: conditions || prev.comorbidities,
      }))
      toast({
        title: 'Patient data loaded',
        description: `Loaded information for ${patient.firstName} ${patient.lastName}`,
      })
    }
  }

  const loadSampleData = () => {
    setFormData({
      diagnosis: 'Type 2 Diabetes Mellitus',
      patientAge: '58',
      patientGender: 'Male',
      comorbidities: 'Hypertension, Hyperlipidemia, Obesity (BMI 32)',
      currentMedications: 'Metformin 1000mg BID, Lisinopril 20mg daily, Atorvastatin 40mg daily',
      allergies: 'Penicillin (rash), Sulfa drugs',
      additionalNotes: 'Recent HbA1c: 8.2%. Patient reports increased thirst and frequent urination. Has been non-compliant with diet. Last eye exam: 6 months ago (no retinopathy). Foot exam: intact sensation, no ulcers.',
    })
    toast({
      title: 'Sample data loaded',
      description: 'Form has been populated with sample Type 2 Diabetes case',
    })
  }

  const handleSubmit = async () => {
    if (!formData.diagnosis) {
      toast({
        title: 'Missing diagnosis',
        description: 'Please enter a diagnosis or condition',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/treatment-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to get recommendations')

      const data = await response.json()
      setResult(data)
      toast({
        title: 'Recommendations generated',
        description: 'Review the evidence-based treatment options below',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getEvidenceBadge = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Treatment Recommendations</h1>
        <p className="text-gray-500">
          Get evidence-based treatment suggestions powered by clinical guidelines
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                Patient Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                <FileText className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Patient
              </Label>
              <Select
                value={selectedPatientId}
                onValueChange={handlePatientSelect}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading..." : "Select patient to load data"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} ({patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Diagnosis / Condition *</Label>
              <Input
                placeholder="e.g., Type 2 Diabetes, Hypertension"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input
                  placeholder="Male/Female"
                  value={formData.patientGender}
                  onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comorbidities</Label>
              <Textarea
                placeholder="List other conditions..."
                value={formData.comorbidities}
                onChange={(e) => setFormData({ ...formData, comorbidities: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea
                placeholder="List current medications..."
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input
                placeholder="Known allergies..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any other relevant information..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Diagnosis Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{result.diagnosis}</h2>
                      <p className="text-gray-500">ICD-10: {result.icdCode}</p>
                    </div>
                    <Badge className="text-lg px-4 py-1 bg-teal-100 text-teal-800">
                      Evidence-Based
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Important Considerations</p>
                        <ul className="mt-2 space-y-1">
                          {result.warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-red-700">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Guidelines */}
              {result.guidelines.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.recommendations.map((rec, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{rec.title}</span>
                              <Badge className={getEvidenceBadge(rec.evidenceLevel)}>
                                Level {rec.evidenceLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{rec.description}</p>
                            <p className="text-xs text-gray-400 ml-6 mt-2">
                              Source: {rec.source}
                              {rec.sourceUrl && (
                                <a href={rec.sourceUrl} target="_blank" rel="noopener" className="ml-1 text-blue-500">
                                  <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Medications */}
              {result.medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Pill className="h-5 w-5 text-purple-600" />
                      Medication Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.medications.map((med, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-lg">{med.name}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Dosage:</span> {med.dosage}
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span> {med.frequency}
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span> {med.duration}
                            </div>
                          </div>
                          {med.contraindications.length > 0 && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              <strong>Contraindications:</strong> {med.contraindications.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                    Follow-up Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{result.followUp}</p>
                  {result.referrals.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested Referrals:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.referrals.map((ref, i) => (
                          <Badge key={i} variant="outline">{ref}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24 text-gray-500">
                <Lightbulb className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg">No recommendations yet</p>
                <p className="text-sm">Enter patient information to get treatment suggestions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
