'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  FileText,
  Send,
  Loader2,
  Copy,
  Download,
  CheckCircle2,
  Printer,
  Mail,
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  medications?: Array<{ name: string; dosage: string }>
  allergies?: Array<{ allergen: string }>
  conditions?: Array<{ name: string }>
}

export default function ReferralLetterPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [copied, setCopied] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientDOB: '',
    patientMRN: '',
    referringProvider: '',
    referringPractice: '',
    referringPhone: '',
    referringFax: '',
    referToSpecialty: '',
    referToProvider: '',
    referToPractice: '',
    urgency: 'routine',
    diagnosis: '',
    reasonForReferral: '',
    relevantHistory: '',
    currentMedications: '',
    allergies: '',
    relevantTests: '',
    specificQuestions: '',
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
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      const medications = patient.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || ''
      const allergies = patient.allergies?.map(a => a.allergen).join(', ') || ''
      const conditions = patient.conditions?.map(c => c.name).join(', ') || ''

      // Use functional update to avoid stale closure
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientDOB: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        patientMRN: patient.mrn,
        currentMedications: medications || prev.currentMedications,
        allergies: allergies || prev.allergies,
        relevantHistory: conditions || prev.relevantHistory,
      }))
      toast({
        title: 'Patient data loaded',
        description: `Loaded information for ${patient.firstName} ${patient.lastName}`,
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.referToSpecialty || !formData.reasonForReferral) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/referral-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to generate letter')

      const data = await response.json()
      setGeneratedLetter(data.letter)
      toast({
        title: 'Letter generated',
        description: 'Review and customize as needed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate referral letter',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied to clipboard' })
  }

  const loadSampleData = () => {
    setFormData({
      patientId: '',
      patientName: 'John Smith',
      patientDOB: '1959-03-15',
      patientMRN: 'MRN-12345',
      referringProvider: 'Dr. Sarah Johnson',
      referringPractice: 'Primary Care Associates',
      referringPhone: '(555) 123-4567',
      referringFax: '(555) 123-4568',
      referToSpecialty: 'cardiology',
      referToProvider: 'Dr. Michael Chen',
      referToPractice: 'Heart & Vascular Specialists',
      urgency: 'urgent',
      diagnosis: 'I25.10 - Atherosclerotic heart disease',
      reasonForReferral: 'Patient presents with exertional chest pain and dyspnea. ECG shows ST-segment changes. Recent stress test positive for ischemia. Requesting evaluation for possible coronary artery disease and consideration for cardiac catheterization.',
      relevantHistory: 'Hypertension x 10 years, Type 2 Diabetes x 5 years, Hyperlipidemia, Former smoker (quit 2 years ago), Family history of MI (father at age 55)',
      currentMedications: 'Metformin 1000mg BID, Lisinopril 20mg daily, Atorvastatin 40mg daily, Aspirin 81mg daily',
      allergies: 'Penicillin (anaphylaxis), Contrast dye (mild rash)',
      relevantTests: 'ECG (12/1/2024): ST depression in leads V4-V6. Stress test (11/28/2024): Positive for ischemia at 6 METs. Lipid panel: LDL 145, HDL 38, TG 220. HbA1c: 7.8%',
      specificQuestions: 'Please evaluate for significant CAD. Is cardiac catheterization indicated? Recommendations for optimization of medical therapy prior to any intervention?',
    })
    toast({
      title: 'Sample data loaded',
      description: 'Form has been populated with sample cardiology referral',
    })
  }

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Psychiatry',
    'Pulmonology',
    'Rheumatology',
    'Urology',
    'General Surgery',
    'Physical Therapy',
    'Pain Management',
    'Other',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Referral Letter Generator</h1>
          <p className="text-gray-500">
            Generate professional referral letters with AI assistance
          </p>
        </div>
        <Button variant="outline" onClick={loadSampleData}>
          <FileText className="h-4 w-4 mr-2" />
          Load Sample Data
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={handlePatientSelect}
                  disabled={loadingPatients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPatients ? "Loading..." : "Select patient"} />
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Patient Name</Label>
                  <Input
                    placeholder="Auto-filled from selection"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.patientDOB}
                    onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>MRN</Label>
                <Input
                  placeholder="Auto-filled from selection"
                  value={formData.patientMRN}
                  onChange={(e) => setFormData({ ...formData, patientMRN: e.target.value })}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referral Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Specialty *</Label>
                  <Select
                    value={formData.referToSpecialty}
                    onValueChange={(value) => setFormData({ ...formData, referToSpecialty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec} value={spec.toLowerCase()}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent (within 1 week)</SelectItem>
                      <SelectItem value="emergent">Emergent (same day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referring To (Provider/Practice)</Label>
                <Input
                  placeholder="Dr. Jane Doe / Specialty Clinic"
                  value={formData.referToProvider}
                  onChange={(e) => setFormData({ ...formData, referToProvider: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Diagnosis / ICD-10</Label>
                <Input
                  placeholder="M54.5 - Low back pain"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Reason for Referral *</Label>
                <Textarea
                  placeholder="Patient presents with..."
                  className="min-h-[100px]"
                  value={formData.reasonForReferral}
                  onChange={(e) => setFormData({ ...formData, reasonForReferral: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Relevant Medical History</Label>
                <Textarea
                  placeholder="Past medical history, surgical history..."
                  value={formData.relevantHistory}
                  onChange={(e) => setFormData({ ...formData, relevantHistory: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Textarea
                  placeholder="Lisinopril 10mg daily, Metformin 500mg BID..."
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <Input
                  placeholder="Penicillin, Sulfa"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Relevant Tests/Imaging</Label>
                <Textarea
                  placeholder="Labs, imaging results..."
                  value={formData.relevantTests}
                  onChange={(e) => setFormData({ ...formData, relevantTests: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Specific Questions for Specialist</Label>
                <Textarea
                  placeholder="Please evaluate for... Please advise on..."
                  value={formData.specificQuestions}
                  onChange={(e) => setFormData({ ...formData, specificQuestions: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Referral Letter
              </>
            )}
          </Button>
        </div>

        {/* Generated Letter */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Generated Letter
                </CardTitle>
                {generatedLetter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedLetter ? (
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-6 min-h-[500px] font-serif text-sm whitespace-pre-wrap">
                    {generatedLetter}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Send via Fax
                    </Button>
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                      <Send className="h-4 w-4 mr-2" />
                      Send to EHR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg">No letter generated yet</p>
                  <p className="text-sm">Fill out the form and click Generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
