'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  gender: string
  conditions?: Array<{ name: string }>
  medications?: Array<{ name: string; dosage: string }>
}

interface CodeSuggestion {
  code: string
  description: string
  confidence: number
}

export default function BillingCoderPage() {
  const { toast } = useToast()
  const [clinicalNote, setClinicalNote] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    icdCodes: CodeSuggestion[]
    cptCodes: CodeSuggestion[]
  } | null>(null)
  const [selectedIcd, setSelectedIcd] = useState<string[]>([])
  const [selectedCpt, setSelectedCpt] = useState<string[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=conditions,medications&limit=100')
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
      // Build a patient context string to prepopulate clinical note
      const age = patient.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : ''
      const conditions = patient.conditions?.map(c => c.name).join(', ') || ''
      const medications = patient.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || ''

      const patientContext = `Patient: ${patient.firstName} ${patient.lastName}
Age: ${age} years old, ${patient.gender || 'Gender not specified'}
Medical History: ${conditions || 'None documented'}
Current Medications: ${medications || 'None documented'}

Chief Complaint: [Enter chief complaint]

`
      // Prepend patient context to existing note or set as new
      setClinicalNote(prev => {
        if (prev.trim() && !prev.startsWith('Patient:')) {
          return patientContext + prev
        }
        return patientContext
      })
      toast({
        title: 'Patient data loaded',
        description: `Loaded information for ${patient.firstName} ${patient.lastName}`,
      })
    }
  }

  const analyzeNote = async () => {
    if (!clinicalNote.trim()) {
      toast({
        title: 'No clinical note',
        description: 'Please enter a clinical note to analyze.',
        variant: 'destructive',
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/billing-coder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicalNote }),
      })

      if (!response.ok) throw new Error('Failed to analyze note')

      const data = await response.json()
      setSuggestions(data)
      setSelectedIcd([])
      setSelectedCpt([])
      toast({
        title: 'Analysis complete',
        description: 'Review the suggested codes below.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze note. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-orange-100 text-orange-800'
  }

  const toggleIcdCode = (code: string) => {
    setSelectedIcd((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const toggleCptCode = (code: string) => {
    setSelectedCpt((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Billing Coder</h1>
        <p className="text-gray-500">
          Analyze clinical notes and get ICD-10 and CPT code suggestions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clinical Note Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Note
            </CardTitle>
            <CardDescription>
              Paste or type the clinical note to analyze
            </CardDescription>
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

            <Textarea
              placeholder="Paste clinical note here..."
              className="min-h-[300px]"
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
            />

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={analyzeNote}
              disabled={isAnalyzing || !clinicalNote.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Suggest Codes
                </>
              )}
            </Button>

            {/* Sample Note */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">Sample Clinical Note:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setClinicalNote(
                    `Chief Complaint: Chest pain

Subjective: 45-year-old male with 2-day history of chest pain. Describes pressure-like pain in central chest radiating to left arm. Pain worse with exertion, improves with rest. Denies SOB, nausea, diaphoresis. PMH significant for HTN and hyperlipidemia on lisinopril and atorvastatin.

Objective: BP 145/90, HR 78, RR 16, SpO2 98%. Heart RRR, no murmurs. Lungs CTA bilaterally. No chest wall tenderness.

Assessment: Atypical chest pain, rule out unstable angina. Hypertension, uncontrolled. Hyperlipidemia.

Plan: EKG and troponins ordered. Chest X-ray. Consider stress test if negative. Increase lisinopril dose. Return if worsening symptoms.`
                  )
                }
              >
                Use Sample Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code Suggestions */}
        <div className="space-y-4">
          {/* ICD-10 Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ICD-10 Diagnosis Codes</CardTitle>
              <CardDescription>
                Suggested diagnosis codes based on the clinical note
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions?.icdCodes && suggestions.icdCodes.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.icdCodes.map((code) => (
                    <div
                      key={code.code}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedIcd.includes(code.code)
                          ? 'border-teal-500 bg-teal-50'
                          : ''
                      }`}
                    >
                      <Checkbox
                        checked={selectedIcd.includes(code.code)}
                        onCheckedChange={() => toggleIcdCode(code.code)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">
                            {code.code}
                          </span>
                          <Badge className={getConfidenceColor(code.confidence)}>
                            {code.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{code.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                  <Calculator className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm">No codes suggested yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CPT Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CPT Procedure Codes</CardTitle>
              <CardDescription>
                Suggested procedure codes based on services documented
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions?.cptCodes && suggestions.cptCodes.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.cptCodes.map((code) => (
                    <div
                      key={code.code}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedCpt.includes(code.code)
                          ? 'border-teal-500 bg-teal-50'
                          : ''
                      }`}
                    >
                      <Checkbox
                        checked={selectedCpt.includes(code.code)}
                        onCheckedChange={() => toggleCptCode(code.code)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">
                            {code.code}
                          </span>
                          <Badge className={getConfidenceColor(code.confidence)}>
                            {code.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{code.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                  <Calculator className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm">No codes suggested yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply Selected */}
          {suggestions && (selectedIcd.length > 0 || selectedCpt.length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Selected Codes</p>
                    <p className="text-sm text-gray-500">
                      {selectedIcd.length} ICD-10, {selectedCpt.length} CPT
                    </p>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                    Apply to Encounter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
