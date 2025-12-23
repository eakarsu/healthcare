'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Save,
  FileSignature,
  AlertTriangle,
  Mic,
  Plus,
  Trash2,
  Search,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatDate, calculateAge, getStatusColor, getSeverityColor } from '@/lib/utils'

interface Encounter {
  id: string
  encounterNumber: string
  type: string
  status: string
  encounterDate: string
  chiefComplaint: string | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  heartRate: number | null
  temperature: number | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  painLevel: number | null
  height: number | null
  weight: number | null
  signedAt: string | null
  signedBy: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    dateOfBirth: string
    gender: string
    allergies: Array<{ allergen: string; severity: string }>
    medications: Array<{ name: string; dosage: string | null }>
  }
  provider: {
    id: string
    user: { firstName: string; lastName: string }
    title: string | null
  }
  diagnoses: Array<{
    id: string
    sequence: number
    icdCode: string
    description: string
  }>
  procedures: Array<{
    id: string
    cptCode: string
    description: string
    quantity: number
  }>
}

export default function EncounterPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    painLevel: '',
    height: '',
    weight: '',
  })

  const [diagnoses, setDiagnoses] = useState<Array<{ icdCode: string; description: string }>>([])
  const [procedures, setProcedures] = useState<Array<{ cptCode: string; description: string; quantity: number }>>([])

  useEffect(() => {
    if (params.id !== 'new') {
      fetchEncounter()
    } else {
      setLoading(false)
    }
  }, [params.id])

  const fetchEncounter = async () => {
    try {
      const response = await fetch(`/api/encounters/${params.id}`)
      if (!response.ok) throw new Error('Encounter not found')
      const data = await response.json()
      setEncounter(data)
      setFormData({
        chiefComplaint: data.chiefComplaint || '',
        subjective: data.subjective || '',
        objective: data.objective || '',
        assessment: data.assessment || '',
        plan: data.plan || '',
        bloodPressureSystolic: data.bloodPressureSystolic?.toString() || '',
        bloodPressureDiastolic: data.bloodPressureDiastolic?.toString() || '',
        heartRate: data.heartRate?.toString() || '',
        temperature: data.temperature?.toString() || '',
        respiratoryRate: data.respiratoryRate?.toString() || '',
        oxygenSaturation: data.oxygenSaturation?.toString() || '',
        painLevel: data.painLevel?.toString() || '',
        height: data.height?.toString() || '',
        weight: data.weight?.toString() || '',
      })
      setDiagnoses(data.diagnoses.map((d: any) => ({ icdCode: d.icdCode, description: d.description })))
      setProcedures(data.procedures.map((p: any) => ({ cptCode: p.cptCode, description: p.description, quantity: p.quantity })))
    } catch (error) {
      console.error('Failed to fetch encounter:', error)
      router.push('/clinical')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/encounters/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
          bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
          oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
          painLevel: formData.painLevel ? parseInt(formData.painLevel) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          diagnoses,
          procedures,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({ title: 'Encounter saved', description: 'Changes have been saved.' })
      fetchEncounter()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save encounter.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSign = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/encounters/${params.id}/sign`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to sign')

      toast({ title: 'Encounter signed', description: 'The encounter has been signed and locked.' })
      setShowSignDialog(false)
      fetchEncounter()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sign encounter.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { icdCode: '', description: '' }])
  }

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index))
  }

  const addProcedure = () => {
    setProcedures([...procedures, { cptCode: '', description: '', quantity: 1 }])
  }

  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!encounter) return null

  const isLocked = encounter.status === 'SIGNED' || encounter.status === 'LOCKED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {encounter.patient.lastName}, {encounter.patient.firstName}
              </h1>
              <Badge className={getStatusColor(encounter.status)}>
                {encounter.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {encounter.encounterNumber} • {formatDate(encounter.encounterDate)} •
              {calculateAge(encounter.patient.dateOfBirth)} yo {encounter.patient.gender.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/ai/scribe">
              <Mic className="mr-2 h-4 w-4" />
              AI Scribe
            </Link>
          </Button>
          {!isLocked && (
            <>
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                    <FileSignature className="mr-2 h-4 w-4" />
                    Sign & Lock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Encounter</DialogTitle>
                    <DialogDescription>
                      Signing this encounter will lock it from further edits. Are you sure?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSign} disabled={saving}>
                      Sign & Lock
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Allergy Alert */}
      {encounter.patient.allergies.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Allergies</p>
            <p className="text-sm text-red-600">
              {encounter.patient.allergies.map((a) => a.allergen).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="soap">
            <TabsList>
              <TabsTrigger value="soap">SOAP Note</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
              <TabsTrigger value="procedures">Procedures</TabsTrigger>
            </TabsList>

            <TabsContent value="soap" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Reason for visit..."
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    disabled={isLocked}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subjective</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Patient's reported symptoms, history of present illness..."
                    className="min-h-[150px]"
                    value={formData.subjective}
                    onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                    disabled={isLocked}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objective</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Physical examination findings..."
                    className="min-h-[150px]"
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    disabled={isLocked}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Clinical impressions and diagnoses..."
                    className="min-h-[150px]"
                    value={formData.assessment}
                    onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                    disabled={isLocked}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Treatment plan, medications, follow-up..."
                    className="min-h-[150px]"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    disabled={isLocked}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Blood Pressure</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Systolic"
                          value={formData.bloodPressureSystolic}
                          onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                          disabled={isLocked}
                        />
                        <span>/</span>
                        <Input
                          placeholder="Diastolic"
                          value={formData.bloodPressureDiastolic}
                          onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">mmHg</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Heart Rate</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="72"
                          value={formData.heartRate}
                          onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">bpm</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Temperature</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="98.6"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">°F</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Respiratory Rate</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="16"
                          value={formData.respiratoryRate}
                          onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">/min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>O2 Saturation</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="98"
                          value={formData.oxygenSaturation}
                          onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pain Level (0-10)</Label>
                      <Input
                        placeholder="0"
                        value={formData.painLevel}
                        onChange={(e) => setFormData({ ...formData, painLevel: e.target.value })}
                        disabled={isLocked}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="68"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">in</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="150"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-500">lbs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnosis" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Diagnoses (ICD-10)</CardTitle>
                  {!isLocked && (
                    <Button variant="outline" size="sm" onClick={addDiagnosis}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {diagnoses.length === 0 ? (
                    <p className="text-sm text-gray-500">No diagnoses added</p>
                  ) : (
                    <div className="space-y-3">
                      {diagnoses.map((dx, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <Input
                            placeholder="ICD-10 Code"
                            className="w-32"
                            value={dx.icdCode}
                            onChange={(e) => {
                              const newDx = [...diagnoses]
                              newDx[index].icdCode = e.target.value
                              setDiagnoses(newDx)
                            }}
                            disabled={isLocked}
                          />
                          <Input
                            placeholder="Description"
                            className="flex-1"
                            value={dx.description}
                            onChange={(e) => {
                              const newDx = [...diagnoses]
                              newDx[index].description = e.target.value
                              setDiagnoses(newDx)
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDiagnosis(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="procedures" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Procedures (CPT)</CardTitle>
                  {!isLocked && (
                    <Button variant="outline" size="sm" onClick={addProcedure}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {procedures.length === 0 ? (
                    <p className="text-sm text-gray-500">No procedures added</p>
                  ) : (
                    <div className="space-y-3">
                      {procedures.map((proc, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder="CPT Code"
                            className="w-32"
                            value={proc.cptCode}
                            onChange={(e) => {
                              const newProc = [...procedures]
                              newProc[index].cptCode = e.target.value
                              setProcedures(newProc)
                            }}
                            disabled={isLocked}
                          />
                          <Input
                            placeholder="Description"
                            className="flex-1"
                            value={proc.description}
                            onChange={(e) => {
                              const newProc = [...procedures]
                              newProc[index].description = e.target.value
                              setProcedures(newProc)
                            }}
                            disabled={isLocked}
                          />
                          <Input
                            placeholder="Qty"
                            className="w-20"
                            type="number"
                            value={proc.quantity}
                            onChange={(e) => {
                              const newProc = [...procedures]
                              newProc[index].quantity = parseInt(e.target.value) || 1
                              setProcedures(newProc)
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProcedure(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">MRN</p>
                <p className="font-medium">{encounter.patient.mrn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DOB</p>
                <p className="font-medium">
                  {formatDate(encounter.patient.dateOfBirth)} ({calculateAge(encounter.patient.dateOfBirth)} yo)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{encounter.patient.gender.toLowerCase()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Current Medications</p>
                {encounter.patient.medications.length === 0 ? (
                  <p className="text-sm text-gray-400">None</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {encounter.patient.medications.map((med, i) => (
                      <li key={i}>
                        {med.name} {med.dosage && `- ${med.dosage}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encounter Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">
                  {encounter.provider.title} {encounter.provider.user.firstName} {encounter.provider.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{encounter.type}</p>
              </div>
              {encounter.signedAt && (
                <div>
                  <p className="text-sm text-gray-500">Signed</p>
                  <p className="font-medium">
                    {formatDate(encounter.signedAt, 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-sm text-gray-500">by {encounter.signedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/ai/billing-coder">
              Suggest Billing Codes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
