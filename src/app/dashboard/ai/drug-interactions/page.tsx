'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Pill,
  Search,
  Loader2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Plus,
  X,
  Shield,
  CheckCircle2,
  User,
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  medications?: Array<{ name: string; dosage: string }>
}

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'major' | 'moderate' | 'minor'
  description: string
  mechanism: string
  clinicalEffects: string[]
  management: string
}

interface InteractionResult {
  medications: string[]
  interactions: DrugInteraction[]
  safeToUse: boolean
  summary: string
  alternatives: {
    originalDrug: string
    alternatives: string[]
    reason: string
  }[]
}

export default function DrugInteractionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InteractionResult | null>(null)
  const [medications, setMedications] = useState<string[]>(['', ''])
  const [newMed, setNewMed] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=medications&limit=100')
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
    if (patient?.medications && patient.medications.length > 0) {
      const patientMeds = patient.medications.map(m => m.name)
      // Merge patient meds with existing meds (remove empty entries, avoid duplicates)
      setMedications(prev => {
        const existingMeds = prev.filter(m => m.trim())
        const allMeds = [...new Set([...patientMeds, ...existingMeds])]
        return allMeds.length > 0 ? allMeds : ['', '']
      })
      toast({
        title: 'Medications loaded',
        description: `Loaded ${patientMeds.length} medications from patient record`,
      })
    }
  }

  const loadSampleData = () => {
    setMedications([
      'Warfarin',
      'Aspirin',
      'Ibuprofen',
      'Metformin',
      'Lisinopril',
    ])
    toast({
      title: 'Sample medications loaded',
      description: 'Loaded 5 medications with known interactions',
    })
  }

  const addMedication = () => {
    if (newMed.trim()) {
      setMedications([...medications.filter(m => m), newMed.trim()])
      setNewMed('')
    }
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, value: string) => {
    const updated = [...medications]
    updated[index] = value
    setMedications(updated)
  }

  const checkInteractions = async () => {
    const validMeds = medications.filter(m => m.trim())
    if (validMeds.length < 2) {
      toast({
        title: 'Need more medications',
        description: 'Please enter at least 2 medications to check for interactions',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: validMeds }),
      })

      if (!response.ok) throw new Error('Failed to check interactions')

      const data = await response.json()
      setResult(data)
      toast({
        title: 'Analysis complete',
        description: `Found ${data.interactions.length} potential interactions`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check drug interactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'major': return <AlertOctagon className="h-5 w-5 text-red-600" />
      case 'moderate': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'minor': return <Info className="h-5 w-5 text-blue-600" />
      default: return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Drug Interaction Checker</h1>
        <p className="text-gray-500">
          Check for potential drug-drug interactions and get safety recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-teal-600" />
                Medication List
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                Load Sample
              </Button>
            </div>
            <CardDescription>
              Select a patient to load their medications or enter manually
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
                  <SelectValue placeholder={loadingPatients ? "Loading..." : "Select patient to load medications"} />
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

            <div className="border-t pt-4 space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Medication ${index + 1}`}
                  value={med}
                  onChange={(e) => updateMedication(index, e.target.value)}
                />
                {medications.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMedication(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add another medication..."
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMedication()}
              />
              <Button variant="outline" size="icon" onClick={addMedication}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={checkInteractions}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Interactions
                </>
              )}
            </Button>

            {/* Common Medications Quick Add */}
            <div className="pt-4">
              <p className="text-xs text-gray-500 mb-2">Quick add common medications:</p>
              <div className="flex flex-wrap gap-1">
                {['Metformin', 'Lisinopril', 'Atorvastatin', 'Omeprazole', 'Aspirin', 'Warfarin'].map((med) => (
                  <Badge
                    key={med}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setMedications([...medications.filter(m => m), med])}
                  >
                    + {med}
                  </Badge>
                ))}
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Summary Card */}
              <Card className={result.safeToUse ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {result.safeToUse ? (
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    ) : (
                      <AlertOctagon className="h-10 w-10 text-red-600" />
                    )}
                    <div>
                      <h3 className={`text-lg font-semibold ${result.safeToUse ? 'text-green-800' : 'text-red-800'}`}>
                        {result.safeToUse ? 'No Major Interactions Found' : 'Interactions Detected'}
                      </h3>
                      <p className={`text-sm ${result.safeToUse ? 'text-green-700' : 'text-red-700'}`}>
                        {result.summary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications Analyzed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Medications Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.medications.map((med, i) => (
                      <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                        <Pill className="h-3 w-3 mr-1" />
                        {med}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interactions */}
              {result.interactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Drug Interactions ({result.interactions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.interactions.map((interaction, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(interaction.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{interaction.drug1}</span>
                              <span className="text-gray-400">+</span>
                              <span className="font-semibold">{interaction.drug2}</span>
                              <Badge className={getSeverityColor(interaction.severity)}>
                                {interaction.severity.toUpperCase()}
                              </Badge>
                            </div>

                            <p className="text-sm mb-3">{interaction.description}</p>

                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Mechanism: </span>
                                <span className="text-gray-600">{interaction.mechanism}</span>
                              </div>

                              <div>
                                <span className="font-medium">Clinical Effects: </span>
                                <span className="text-gray-600">{interaction.clinicalEffects.join(', ')}</span>
                              </div>

                              <div className="p-2 bg-white rounded border mt-2">
                                <span className="font-medium">Management: </span>
                                <span className="text-gray-700">{interaction.management}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Alternatives */}
              {result.alternatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Suggested Alternatives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.alternatives.map((alt, i) => (
                      <div key={i} className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-medium mb-2">
                          Instead of <span className="text-blue-700">{alt.originalDrug}</span>, consider:
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {alt.alternatives.map((drug, j) => (
                            <Badge key={j} variant="outline" className="bg-white">
                              {drug}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{alt.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24 text-gray-500">
                <Pill className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg">No analysis yet</p>
                <p className="text-sm">Enter medications and click Check Interactions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
