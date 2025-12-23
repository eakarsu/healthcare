'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mic, MicOff, Play, Pause, Square, FileText, Code, CheckCircle, AlertCircle } from 'lucide-react'

interface SpeakerSegment {
  speaker: 'PROVIDER' | 'PATIENT' | 'UNKNOWN'
  text: string
  startTime: number
  endTime: number
  confidence: number
}

interface SOAPNote {
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface CodeSuggestion {
  type: 'ICD10' | 'CPT'
  code: string
  description: string
  confidence: number
}

export default function AmbientScribePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [speakerSegments, setSpeakerSegments] = useState<SpeakerSegment[]>([])
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null)
  const [suggestedCodes, setSuggestedCodes] = useState<{ icdCodes: CodeSuggestion[]; cptCodes: CodeSuggestion[] } | null>(null)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'completed'>('idle')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Mock patients list - in production, fetch from API
  const patients = [
    { id: 'patient-1', name: 'John Smith' },
    { id: 'patient-2', name: 'Jane Doe' },
    { id: 'patient-3', name: 'Robert Johnson' }
  ]

  const startRecording = async () => {
    try {
      setError(null)

      if (!selectedPatient) {
        setError('Please select a patient first')
        return
      }

      // Start session
      const response = await fetch('/api/ambient-scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient,
          providerId: 'provider-1' // In production, get from session
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSessionId(data.data.sessionId)

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(1000) // Capture every second
      setIsRecording(true)
      setStatus('recording')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setIsPaused(false)
      setStatus('processing')

      // In production, send audio to transcription service
      // For demo, use the simulated transcript
      await simulateTranscription()
    }
  }

  const simulateTranscription = async () => {
    // Simulate transcription delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockTranscript = `Doctor: Good morning, what brings you in today?

Patient: I've been having headaches for the past three days. They're mostly in the front of my head and feel like pressure.

Doctor: I see. On a scale of 1 to 10, how severe would you rate the pain?

Patient: I'd say about a 6 or 7. It's definitely interfering with my work.

Doctor: Have you noticed any other symptoms like nausea, light sensitivity, or visual changes?

Patient: Yes, bright lights do bother me, and I've felt a bit nauseous in the mornings.

Doctor: Any recent stress or changes in your sleep patterns?

Patient: Actually, I've been under a lot of stress at work, and I haven't been sleeping well.

Doctor: Based on what you're describing, it sounds like you may be experiencing tension headaches, possibly with some migraine features. Let me do a quick examination.`

    setTranscript(mockTranscript)

    // Update session with transcript
    if (sessionId) {
      await fetch(`/api/ambient-scribe/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_TRANSCRIPTION',
          data: { text: mockTranscript }
        })
      })
    }

    // Set mock speaker segments
    setSpeakerSegments([
      { speaker: 'PROVIDER', text: 'Good morning, what brings you in today?', startTime: 0, endTime: 3000, confidence: 0.95 },
      { speaker: 'PATIENT', text: "I've been having headaches for the past three days...", startTime: 3000, endTime: 10000, confidence: 0.92 },
      { speaker: 'PROVIDER', text: 'On a scale of 1 to 10, how severe...', startTime: 10000, endTime: 14000, confidence: 0.94 },
      { speaker: 'PATIENT', text: "I'd say about a 6 or 7...", startTime: 14000, endTime: 18000, confidence: 0.91 }
    ])

    setStatus('completed')
  }

  const generateSOAPNote = async () => {
    if (!sessionId) return

    setStatus('processing')

    try {
      const response = await fetch(`/api/ambient-scribe/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_SOAP' })
      })

      const data = await response.json()

      if (response.ok) {
        setSoapNote(data.data.soapNote)
      } else {
        // Use mock SOAP note for demo
        setSoapNote({
          chiefComplaint: 'Headaches for 3 days',
          subjective: 'Patient presents with 3-day history of frontal headaches described as pressure sensation, rated 6-7/10 severity. Reports photophobia and morning nausea. Notes increased work stress and poor sleep quality recently.',
          objective: 'Vital signs: BP 128/82, HR 76, Temp 98.4°F. General: Alert, appears uncomfortable. HEENT: Normocephalic, no tenderness to palpation. Neck: Supple, no rigidity. Neuro: CN II-XII intact, no focal deficits.',
          assessment: '1. Tension-type headache with migrainous features - likely related to stress and sleep disturbance\n2. Photophobia\n3. Stress-related symptoms',
          plan: '1. Trial of OTC analgesics (ibuprofen 400mg q6h PRN)\n2. Stress management and sleep hygiene counseling\n3. Avoid known triggers\n4. Return if symptoms worsen or new symptoms develop\n5. Consider migraine prophylaxis if headaches persist'
        })
      }
    } catch (err) {
      setError((err as Error).message)
    }

    setStatus('completed')
  }

  const suggestCodes = async () => {
    if (!sessionId || !soapNote) return

    setStatus('processing')

    try {
      const response = await fetch(`/api/ambient-scribe/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUGGEST_CODES' })
      })

      const data = await response.json()

      if (response.ok) {
        setSuggestedCodes(data.data.suggestedCodes)
      } else {
        // Use mock codes for demo
        setSuggestedCodes({
          icdCodes: [
            { type: 'ICD10', code: 'G44.209', description: 'Tension-type headache, unspecified, not intractable', confidence: 0.92 },
            { type: 'ICD10', code: 'R51.9', description: 'Headache, unspecified', confidence: 0.85 },
            { type: 'ICD10', code: 'H53.14', description: 'Visual discomfort (photophobia)', confidence: 0.78 }
          ],
          cptCodes: [
            { type: 'CPT', code: '99214', description: 'Office visit, established patient, moderate complexity', confidence: 0.88 }
          ]
        })
      }
    } catch (err) {
      setError((err as Error).message)
    }

    setStatus('completed')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Ambient Scribe</h1>
          <p className="text-muted-foreground">
            AI-powered clinical documentation from patient encounters
          </p>
        </div>
        <Badge variant={status === 'recording' ? 'destructive' : status === 'processing' ? 'secondary' : 'outline'}>
          {status === 'idle' && 'Ready'}
          {status === 'recording' && 'Recording'}
          {status === 'processing' && 'Processing...'}
          {status === 'completed' && 'Completed'}
        </Badge>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recording Controls
            </CardTitle>
            <CardDescription>
              Select a patient and start recording the clinical encounter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="flex-1" disabled={!selectedPatient}>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <>
                  {!isPaused ? (
                    <Button onClick={pauseRecording} variant="outline" className="flex-1">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeRecording} variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={stopRecording} variant="destructive" className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center justify-center p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                  {isPaused ? 'Paused' : 'Recording...'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Transcript */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Live Transcript
            </CardTitle>
            <CardDescription>
              Real-time transcription with speaker identification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto">
              {speakerSegments.length > 0 ? (
                <div className="space-y-3">
                  {speakerSegments.map((segment, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Badge variant={segment.speaker === 'PROVIDER' ? 'default' : 'secondary'} className="shrink-0">
                        {segment.speaker}
                      </Badge>
                      <p className="text-sm">{segment.text}</p>
                    </div>
                  ))}
                </div>
              ) : transcript ? (
                <p className="text-sm whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Transcript will appear here during recording...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SOAP Note */}
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
            {!soapNote ? (
              <div className="text-center py-8">
                <Button onClick={generateSOAPNote} disabled={!transcript || status === 'processing'}>
                  Generate SOAP Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                  <Textarea value={soapNote.chiefComplaint} rows={1} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subjective</label>
                  <Textarea value={soapNote.subjective} rows={3} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Objective</label>
                  <Textarea value={soapNote.objective} rows={3} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assessment</label>
                  <Textarea value={soapNote.assessment} rows={3} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan</label>
                  <Textarea value={soapNote.plan} rows={4} className="mt-1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Suggested Billing Codes
            </CardTitle>
            <CardDescription>
              AI-suggested ICD-10 and CPT codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!suggestedCodes ? (
              <div className="text-center py-8">
                <Button onClick={suggestCodes} disabled={!soapNote || status === 'processing'}>
                  Suggest Codes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">ICD-10 Diagnosis Codes</h4>
                  <div className="space-y-2">
                    {suggestedCodes.icdCodes.map((code, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-mono font-medium">{code.code}</span>
                          <span className="text-sm text-muted-foreground">{code.description}</span>
                        </div>
                        <Badge variant="outline">{Math.round(code.confidence * 100)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">CPT Procedure Codes</h4>
                  <div className="space-y-2">
                    {suggestedCodes.cptCodes.map((code, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-mono font-medium">{code.code}</span>
                          <span className="text-sm text-muted-foreground">{code.description}</span>
                        </div>
                        <Badge variant="outline">{Math.round(code.confidence * 100)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
