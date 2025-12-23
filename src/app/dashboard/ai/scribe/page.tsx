'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mic,
  MicOff,
  Play,
  Square,
  Loader2,
  Copy,
  Check,
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
  allergies?: Array<{ allergen: string }>
}

export default function AIScribePage() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [soapNote, setSoapNote] = useState<{
    chiefComplaint: string
    subjective: string
    objective: string
    assessment: string
    plan: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=conditions,medications,allergies&limit=100')
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
      const conditions = patient.conditions?.map(c => c.name).join(', ') || 'no known conditions'
      const medications = patient.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || 'none'
      const allergies = patient.allergies?.map(a => a.allergen).join(', ') || 'NKDA'

      const patientContext = `Patient is a ${age}-year-old ${patient.gender?.toLowerCase() || ''} with a history of ${conditions}. Currently taking ${medications}. Allergies: ${allergies}. Patient presents with `
      // Prepend patient context to existing transcription or set as new
      setTranscription(prev => {
        if (prev.trim() && !prev.startsWith('Patient is a')) {
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

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      // In a real implementation, stop recording and process audio
      toast({
        title: 'Recording stopped',
        description: 'Processing your audio...',
      })
    } else {
      setIsRecording(true)
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone.',
      })
    }
  }

  const generateSOAPNote = async () => {
    if (!transcription.trim()) {
      toast({
        title: 'No transcription',
        description: 'Please enter or record a transcription first.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription }),
      })

      if (!response.ok) throw new Error('Failed to generate note')

      const data = await response.json()
      setSoapNote(data)
      toast({
        title: 'SOAP note generated',
        description: 'Review and edit as needed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate SOAP note. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(section)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Medical Scribe</h1>
        <p className="text-gray-500">
          Record or type clinical encounters and generate structured SOAP notes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recording / Transcription Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Recording
              </CardTitle>
              <CardDescription>
                Record your clinical encounter or paste transcription below
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

              <div className="flex items-center justify-center gap-4 py-8">
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                  className={isRecording ? '' : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'}
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <>
                      <Square className="mr-2 h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm text-red-500">Recording...</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Transcription</Label>
                <Textarea
                  placeholder="Type or paste your clinical encounter transcription here..."
                  className="min-h-[200px]"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                onClick={generateSOAPNote}
                disabled={isProcessing || !transcription.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate SOAP Note
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sample Transcription */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sample Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                &quot;Patient is a 45-year-old male presenting with chest pain for the past 2 days.
                Pain is described as pressure-like, located in the center of the chest, radiating
                to the left arm. Pain is worse with exertion and improves with rest. Patient denies
                shortness of breath, nausea, or sweating. Has a history of hypertension and
                hyperlipidemia. Currently taking lisinopril and atorvastatin. Vital signs show
                blood pressure 145/90, heart rate 78, respiratory rate 16, oxygen saturation 98%.
                Physical exam reveals regular heart rhythm, no murmurs, lungs clear bilaterally.
                Plan to order EKG, cardiac enzymes, and chest X-ray. Will consider stress test
                if initial workup is negative.&quot;
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setTranscription(
                  "Patient is a 45-year-old male presenting with chest pain for the past 2 days. Pain is described as pressure-like, located in the center of the chest, radiating to the left arm. Pain is worse with exertion and improves with rest. Patient denies shortness of breath, nausea, or sweating. Has a history of hypertension and hyperlipidemia. Currently taking lisinopril and atorvastatin. Vital signs show blood pressure 145/90, heart rate 78, respiratory rate 16, oxygen saturation 98%. Physical exam reveals regular heart rhythm, no murmurs, lungs clear bilaterally. Plan to order EKG, cardiac enzymes, and chest X-ray. Will consider stress test if initial workup is negative."
                )}
              >
                Use Sample
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated SOAP Note */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated SOAP Note
              </CardTitle>
              <CardDescription>
                AI-generated clinical documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {soapNote ? (
                <>
                  {/* Chief Complaint */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Chief Complaint</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(soapNote.chiefComplaint, 'cc')}
                      >
                        {copied === 'cc' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-sm">
                      {soapNote.chiefComplaint}
                    </div>
                  </div>

                  {/* Subjective */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Subjective</Label>
                      <Badge variant="outline">S</Badge>
                    </div>
                    <Textarea
                      className="min-h-[100px]"
                      value={soapNote.subjective}
                      onChange={(e) =>
                        setSoapNote({ ...soapNote, subjective: e.target.value })
                      }
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Objective</Label>
                      <Badge variant="outline">O</Badge>
                    </div>
                    <Textarea
                      className="min-h-[100px]"
                      value={soapNote.objective}
                      onChange={(e) =>
                        setSoapNote({ ...soapNote, objective: e.target.value })
                      }
                    />
                  </div>

                  {/* Assessment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Assessment</Label>
                      <Badge variant="outline">A</Badge>
                    </div>
                    <Textarea
                      className="min-h-[100px]"
                      value={soapNote.assessment}
                      onChange={(e) =>
                        setSoapNote({ ...soapNote, assessment: e.target.value })
                      }
                    />
                  </div>

                  {/* Plan */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Plan</Label>
                      <Badge variant="outline">P</Badge>
                    </div>
                    <Textarea
                      className="min-h-[100px]"
                      value={soapNote.plan}
                      onChange={(e) =>
                        setSoapNote({ ...soapNote, plan: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      Save to Encounter
                    </Button>
                    <Button
                      className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                      onClick={() => {
                        const fullNote = `Chief Complaint: ${soapNote.chiefComplaint}\n\nSubjective:\n${soapNote.subjective}\n\nObjective:\n${soapNote.objective}\n\nAssessment:\n${soapNote.assessment}\n\nPlan:\n${soapNote.plan}`
                        copyToClipboard(fullNote, 'full')
                      }}
                    >
                      {copied === 'full' ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex h-[400px] flex-col items-center justify-center text-gray-500">
                  <FileText className="mb-4 h-12 w-12 text-gray-300" />
                  <p>No note generated yet</p>
                  <p className="text-sm">
                    Record or type a transcription to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
