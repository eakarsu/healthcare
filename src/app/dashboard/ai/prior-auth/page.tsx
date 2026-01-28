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
  Shield,
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Download,
  Copy,
  FileText,
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  insurances?: Array<{
    insurancePlan: { payerName: string }
  }>
}

interface AuthorizationResult {
  status: 'approved' | 'pending' | 'denied' | 'needs_info'
  referenceNumber: string
  estimatedDecisionDate: string
  requirements: string[]
  generatedLetter: string
  tips: string[]
}

export default function PriorAuthPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuthorizationResult | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    insurancePlan: '',
    procedureCode: '',
    procedureName: '',
    diagnosis: '',
    clinicalJustification: '',
    urgency: 'routine',
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=insurances&limit=100')
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
      const insurancePlan = patient.insurances?.[0]?.insurancePlan?.payerName?.toLowerCase() || ''
      let mappedInsurance = ''
      if (insurancePlan.includes('aetna')) mappedInsurance = 'aetna'
      else if (insurancePlan.includes('blue') || insurancePlan.includes('bcbs')) mappedInsurance = 'bcbs'
      else if (insurancePlan.includes('united')) mappedInsurance = 'united'
      else if (insurancePlan.includes('cigna')) mappedInsurance = 'cigna'
      else if (insurancePlan.includes('medicare')) mappedInsurance = 'medicare'

      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        insurancePlan: mappedInsurance || prev.insurancePlan,
      }))
      toast({
        title: 'Patient data loaded',
        description: `Loaded information for ${patient.firstName} ${patient.lastName}`,
      })
    }
  }

  const loadSampleData = () => {
    setFormData({
      patientId: '',
      patientName: 'John Smith',
      insurancePlan: 'bcbs',
      procedureCode: '27447',
      procedureName: 'Total Knee Arthroplasty (Replacement)',
      diagnosis: 'M17.11 - Primary osteoarthritis, right knee',
      clinicalJustification: `Patient is a 68-year-old male with severe degenerative osteoarthritis of the right knee.

Conservative treatment history over the past 18 months includes:
- Physical therapy (3 courses, 6 weeks each) with minimal improvement
- NSAIDs (Meloxicam 15mg daily) for 12 months - discontinued due to GI symptoms
- Corticosteroid injections (3 injections, most recent 4 months ago) - temporary relief only
- Hyaluronic acid injection series - minimal benefit
- Knee bracing and activity modification

Current status:
- Kellgren-Lawrence Grade IV changes on X-ray
- Bone-on-bone contact with complete loss of medial joint space
- Significant varus deformity (8 degrees)
- Pain score: 8/10 at rest, 10/10 with activity
- Unable to walk more than 1 block without severe pain
- Significant impact on activities of daily living
- Failed all conservative measures

Surgery is medically necessary to restore function and quality of life.`,
      urgency: 'routine',
    })
    toast({
      title: 'Sample data loaded',
      description: 'Form has been populated with sample knee replacement authorization request',
    })
  }

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.procedureCode || !formData.diagnosis) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/prior-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to process request')

      const data = await response.json()
      setResult(data)
      toast({
        title: 'Authorization request processed',
        description: 'Review the generated documentation below',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process authorization request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'denied': return 'bg-red-100 text-red-800'
      case 'needs_info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: 'Copied to clipboard' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Prior Authorization Assistant</h1>
        <p className="text-gray-500">
          Automate prior authorization requests with AI-generated documentation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Authorization Request
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                <FileText className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
            </div>
            <CardDescription>
              Enter procedure and patient information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label>Insurance Plan</Label>
                <Select
                  value={formData.insurancePlan}
                  onValueChange={(value) => setFormData({ ...formData, insurancePlan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aetna">Aetna PPO</SelectItem>
                    <SelectItem value="bcbs">Blue Cross PPO</SelectItem>
                    <SelectItem value="united">UnitedHealthcare</SelectItem>
                    <SelectItem value="cigna">Cigna PPO</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CPT Code *</Label>
                <Input
                  placeholder="27447"
                  value={formData.procedureCode}
                  onChange={(e) => setFormData({ ...formData, procedureCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Procedure Name</Label>
                <Input
                  placeholder="Total Knee Replacement"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diagnosis (ICD-10) *</Label>
              <Input
                placeholder="M17.11 - Primary osteoarthritis, right knee"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Clinical Justification</Label>
              <Textarea
                placeholder="Patient has failed conservative treatment including physical therapy for 6 months, NSAIDs, and corticosteroid injections..."
                className="min-h-[120px]"
                value={formData.clinicalJustification}
                onChange={(e) => setFormData({ ...formData, clinicalJustification: e.target.value })}
              />
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
                  <SelectItem value="urgent">Urgent (24-72 hours)</SelectItem>
                  <SelectItem value="emergent">Emergent (Same day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Authorization Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      Authorization Status
                    </CardTitle>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Reference Number</p>
                      <p className="font-medium">{result.referenceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Est. Decision Date</p>
                      <p className="font-medium">{result.estimatedDecisionDate}</p>
                    </div>
                  </div>

                  {result.requirements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Documents</p>
                      <ul className="space-y-1">
                        {result.requirements.map((req, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.tips.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Tips for Approval
                      </p>
                      <ul className="space-y-1">
                        {result.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-amber-700">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Generated Authorization Letter</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.generatedLetter)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                    {result.generatedLetter}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Clock className="h-12 w-12 text-gray-300 mb-4" />
                <p>No authorization request generated yet</p>
                <p className="text-sm">Fill out the form and click generate</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
