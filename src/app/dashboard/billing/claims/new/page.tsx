'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  insurances: Array<{
    id: string
    insurancePlan: {
      payerName: string
      name: string
    }
  }>
}

interface Encounter {
  id: string
  encounterNumber: string
  encounterDate: string
  status: string
  provider: {
    user: { firstName: string; lastName: string }
  }
  diagnoses: Array<{
    icdCode: string
    description: string
    sequence: number
  }>
  procedures: Array<{
    cptCode: string
    description: string
  }>
}

interface ClaimLine {
  cptCode: string
  description: string
  modifiers: string[]
  quantity: number
  chargeAmount: number
  diagnosisPointers: number[]
}

export default function NewClaimPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingEncounters, setLoadingEncounters] = useState(false)

  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedEncounterId, setSelectedEncounterId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null)

  const [lines, setLines] = useState<ClaimLine[]>([])
  const [newLine, setNewLine] = useState<ClaimLine>({
    cptCode: '',
    description: '',
    modifiers: [],
    quantity: 1,
    chargeAmount: 0,
    diagnosisPointers: [1],
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

  const fetchEncounters = async (patientId: string) => {
    setLoadingEncounters(true)
    try {
      const response = await fetch(`/api/encounters?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setEncounters(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch encounters:', error)
    } finally {
      setLoadingEncounters(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setSelectedEncounterId('')
    setSelectedEncounter(null)
    setLines([])
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    if (patientId) {
      fetchEncounters(patientId)
    } else {
      setEncounters([])
    }
  }

  const handleEncounterSelect = (encounterId: string) => {
    setSelectedEncounterId(encounterId)
    const encounter = encounters.find(e => e.id === encounterId)
    setSelectedEncounter(encounter || null)

    // Pre-populate lines from encounter procedures
    if (encounter?.procedures) {
      const prefilledLines = encounter.procedures.map(proc => ({
        cptCode: proc.cptCode,
        description: proc.description,
        modifiers: [],
        quantity: 1,
        chargeAmount: 100, // Default price
        diagnosisPointers: [1],
      }))
      setLines(prefilledLines)
    } else {
      setLines([])
    }
  }

  const addLine = () => {
    if (!newLine.cptCode || !newLine.chargeAmount) {
      toast({
        title: 'Missing information',
        description: 'Please enter CPT code and charge amount',
        variant: 'destructive',
      })
      return
    }
    setLines([...lines, { ...newLine }])
    setNewLine({
      cptCode: '',
      description: '',
      modifiers: [],
      quantity: 1,
      chargeAmount: 0,
      diagnosisPointers: [1],
    })
  }

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const totalCharges = lines.reduce((sum, line) => sum + (line.chargeAmount * line.quantity), 0)

  const handleSubmit = async () => {
    if (!selectedEncounterId) {
      toast({
        title: 'Missing encounter',
        description: 'Please select an encounter',
        variant: 'destructive',
      })
      return
    }

    if (lines.length === 0) {
      toast({
        title: 'No service lines',
        description: 'Please add at least one service line',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId: selectedEncounterId,
          lines: lines.map(line => ({
            cptCode: line.cptCode,
            description: line.description,
            modifiers: line.modifiers,
            quantity: line.quantity,
            chargeAmount: line.chargeAmount * line.quantity,
            diagnosisPointers: line.diagnosisPointers,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Claim created',
          description: `Claim ${data.claimNumber} has been created successfully`,
        })
        router.push(`/dashboard/billing/claims/${data.id}`)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create claim',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create claim:', error)
      toast({
        title: 'Error',
        description: 'Failed to create claim',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/billing/claims">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Claim</h1>
          <p className="text-gray-500">Create a new insurance claim</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient & Encounter Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Encounter</CardTitle>
            <CardDescription>Select patient and encounter for this claim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select
                value={selectedPatientId}
                onValueChange={handlePatientSelect}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient..."} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} - {patient.mrn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatient && selectedPatient.insurances?.[0] && (
                <p className="text-sm text-gray-500">
                  Insurance: {selectedPatient.insurances[0].insurancePlan.payerName} - {selectedPatient.insurances[0].insurancePlan.name}
                </p>
              )}
              {selectedPatient && !selectedPatient.insurances?.[0] && (
                <p className="text-sm text-red-500">
                  Warning: Patient has no primary insurance on file
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Encounter *</Label>
              <Select
                value={selectedEncounterId}
                onValueChange={handleEncounterSelect}
                disabled={!selectedPatientId || loadingEncounters}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedPatientId
                      ? "Select patient first..."
                      : loadingEncounters
                        ? "Loading encounters..."
                        : "Select encounter..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {encounters.map((encounter) => (
                    <SelectItem key={encounter.id} value={encounter.id}>
                      {encounter.encounterNumber} - {formatDate(encounter.encounterDate)} ({encounter.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEncounter && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="text-sm font-medium">Encounter Details</p>
                <p className="text-sm text-gray-600">
                  Provider: Dr. {selectedEncounter.provider?.user?.firstName} {selectedEncounter.provider?.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(selectedEncounter.encounterDate)}
                </p>
                {selectedEncounter.diagnoses?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mt-2">Diagnoses:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedEncounter.diagnoses.map((dx, i) => (
                        <li key={i}>{dx.icdCode} - {dx.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Line */}
        <Card>
          <CardHeader>
            <CardTitle>Add Service Line</CardTitle>
            <CardDescription>Add CPT codes and charges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPT Code *</Label>
                <Input
                  placeholder="e.g., 99213"
                  value={newLine.cptCode}
                  onChange={(e) => setNewLine({ ...newLine, cptCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newLine.quantity}
                  onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Service description"
                value={newLine.description}
                onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Charge Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newLine.chargeAmount || ''}
                  onChange={(e) => setNewLine({ ...newLine, chargeAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modifiers</Label>
                <Input
                  placeholder="e.g., 25, 59"
                  value={newLine.modifiers.join(', ')}
                  onChange={(e) => setNewLine({
                    ...newLine,
                    modifiers: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>

            <Button onClick={addLine} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Lines</CardTitle>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500">
              <FileText className="mb-2 h-8 w-8 text-gray-300" />
              <p>No service lines added yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line #</TableHead>
                  <TableHead>CPT Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Modifiers</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{line.cptCode}</TableCell>
                    <TableCell>{line.description || '-'}</TableCell>
                    <TableCell>{line.modifiers.join(', ') || '-'}</TableCell>
                    <TableCell className="text-center">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.chargeAmount)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(line.chargeAmount * line.quantity)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={6} className="text-right">Total Charges:</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCharges)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/billing/claims">Cancel</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedEncounterId || lines.length === 0}
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            'Create Claim'
          )}
        </Button>
      </div>
    </div>
  )
}
