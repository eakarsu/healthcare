'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Pill,
  FileText,
  CreditCard,
  Clock,
  Edit,
  Plus,
  DollarSign,
  Download,
  Stethoscope,
  Upload,
} from 'lucide-react'
import { formatDate, formatPhone, calculateAge, getStatusColor, getSeverityColor, formatCurrency } from '@/lib/utils'
import { PaymentMethodsList, SaveCardModal } from '@/components/payments'
import { Wallet } from 'lucide-react'

interface PatientDetail {
  id: string
  mrn: string
  firstName: string
  lastName: string
  middleName: string | null
  preferredName: string | null
  dateOfBirth: string
  gender: string
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  status: string
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
  bloodType: string | null
  insurances: Array<{
    id: string
    priority: number
    subscriberId: string
    isVerified: boolean
    insurancePlan: {
      name: string
      payerName: string
    }
  }>
  allergies: Array<{
    id: string
    allergen: string
    severity: string
    reaction: string | null
  }>
  medications: Array<{
    id: string
    name: string
    dosage: string | null
    frequency: string | null
    status: string
  }>
  conditions: Array<{
    id: string
    name: string
    icdCode: string | null
    status: string
  }>
  appointments: Array<{
    id: string
    scheduledStart: string
    status: string
    type: { name: string }
    provider: { user: { firstName: string; lastName: string } }
  }>
  encounters: Array<{
    id: string
    encounterNumber: string
    type: string
    status: string
    encounterDate: string
    chiefComplaint: string | null
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
    }>
    provider: { user: { firstName: string; lastName: string } }
  }>
  claims: Array<{
    id: string
    claimNumber: string
    status: string
    serviceDate: string
    submittedDate: string | null
    totalCharges: number
    paidAmount: number | null
    patientResponsibility: number | null
    insurancePlan: { name: string; payerName: string } | null
    lines: Array<{
      id: string
      cptCode: string
      description: string
      chargeAmount: number
    }>
    payments: Array<{
      id: string
      amount: number
      paymentDate: string
      payerType: string
    }>
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    category: string | null
    fileSize: number
    mimeType: string
    description: string | null
    createdAt: string
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    reference: string | null
    date: string
    notes: string | null
  }>
}

const documentTypes = [
  'INTAKE_FORM',
  'CONSENT',
  'INSURANCE_CARD',
  'ID',
  'LAB_RESULT',
  'IMAGING',
  'REFERRAL',
  'CORRESPONDENCE',
  'OTHER',
]

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('OTHER')
  const [documentDescription, setDocumentDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaveCardOpen, setIsSaveCardOpen] = useState(false)
  const [paymentMethodsKey, setPaymentMethodsKey] = useState(0) // To refresh list after adding card

  useEffect(() => {
    fetchPatient()
  }, [params.id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`)
      if (!response.ok) throw new Error('Patient not found')
      const data = await response.json()
      setPatient(data)
    } catch (error) {
      console.error('Failed to fetch patient:', error)
      router.push('/dashboard/patients')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!patient) return null

  const hasAllergies = patient.allergies.length > 0
  const severeAllergies = patient.allergies.filter(
    (a) => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING'
  )

  const handleDownloadDocument = (doc: { id: string; name: string; mimeType: string }) => {
    // Create a mock file download for demo purposes
    const content = `This is a placeholder for: ${doc.name}\n\nDocument ID: ${doc.id}\nType: ${doc.mimeType}\n\nIn a production environment, this would download the actual file from secure storage.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name.replace(/\.[^/.]+$/, '') + '.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    try {
      const response = await fetch(`/api/patients/${params.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFile.name,
          type: documentType,
          category: documentType.replace(/_/g, ' '),
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || 'application/octet-stream',
          description: documentDescription || null,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Document uploaded',
          description: 'The document has been uploaded successfully.',
        })
        setIsUploadDialogOpen(false)
        setSelectedFile(null)
        setDocumentType('OTHER')
        setDocumentDescription('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        fetchPatient()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to upload document',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

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
                {patient.lastName}, {patient.firstName}
                {patient.middleName && ` ${patient.middleName}`}
              </h1>
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span>MRN: {patient.mrn}</span>
              <span>•</span>
              <span>{calculateAge(patient.dateOfBirth)} years old</span>
              <span>•</span>
              <span className="capitalize">{patient.gender.toLowerCase()}</span>
              {patient.bloodType && (
                <>
                  <span>•</span>
                  <span>Blood Type: {patient.bloodType}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/schedule?patient=${patient.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clinical?patient=${patient.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              New Encounter
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Allergy Alert */}
      {severeAllergies.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Allergy Alert</p>
            <p className="text-sm text-red-600">
              {severeAllergies.map((a) => a.allergen).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="encounters">Encounters</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{formatPhone(patient.phone)}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span>
                        {patient.address}
                        {patient.city && `, ${patient.city}`}
                        {patient.state && `, ${patient.state}`}
                        {patient.zip && ` ${patient.zip}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Allergies</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.allergies.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No known allergies (NKDA)
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {patient.allergies.map((allergy) => (
                        <div
                          key={allergy.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div>
                            <span className="font-medium">{allergy.allergen}</span>
                            {allergy.reaction && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({allergy.reaction})
                              </span>
                            )}
                          </div>
                          <Badge className={getSeverityColor(allergy.severity)}>
                            {allergy.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Medications</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.medications.filter((m) => m.status === 'active').length === 0 ? (
                    <p className="text-sm text-gray-500">No active medications</p>
                  ) : (
                    <div className="space-y-2">
                      {patient.medications
                        .filter((m) => m.status === 'active')
                        .map((med) => (
                          <div
                            key={med.id}
                            className="flex items-center gap-3 rounded-lg border px-3 py-2"
                          >
                            <Pill className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="font-medium">{med.name}</span>
                              {med.dosage && (
                                <span className="text-sm text-gray-500 ml-2">
                                  {med.dosage} {med.frequency && `- ${med.frequency}`}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Active Conditions</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.conditions.filter((c) => c.status === 'active').length === 0 ? (
                    <p className="text-sm text-gray-500">No active conditions</p>
                  ) : (
                    <div className="space-y-2">
                      {patient.conditions
                        .filter((c) => c.status === 'active')
                        .map((condition) => (
                          <div
                            key={condition.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                          >
                            <span>{condition.name}</span>
                            {condition.icdCode && (
                              <Badge variant="outline">{condition.icdCode}</Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.appointments.length === 0 ? (
                    <p className="text-sm text-gray-500">No appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {patient.appointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{appt.type.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(appt.scheduledStart, 'MMM d, yyyy h:mm a')} •{' '}
                                Dr. {appt.provider.user.lastName}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(appt.status)}>
                            {appt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encounters" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Encounter History</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.encounters.length === 0 ? (
                    <p className="text-sm text-gray-500">No encounters</p>
                  ) : (
                    <div className="space-y-4">
                      {patient.encounters.map((encounter) => (
                        <div
                          key={encounter.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Stethoscope className="h-5 w-5 text-teal-600" />
                              <div>
                                <p className="font-medium">{encounter.type}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(encounter.encounterDate, 'MMM d, yyyy')} • Dr. {encounter.provider.user.lastName}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(encounter.status)}>
                              {encounter.status}
                            </Badge>
                          </div>
                          {encounter.chiefComplaint && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Chief Complaint:</span> {encounter.chiefComplaint}
                            </p>
                          )}
                          {encounter.diagnoses.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Diagnoses:</p>
                              <div className="flex flex-wrap gap-1">
                                {encounter.diagnoses.map((dx) => (
                                  <Badge key={dx.id} variant="outline" className="text-xs">
                                    {dx.icdCode}: {dx.description}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {encounter.procedures.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Procedures:</p>
                              <div className="flex flex-wrap gap-1">
                                {encounter.procedures.map((proc) => (
                                  <Badge key={proc.id} variant="secondary" className="text-xs">
                                    {proc.cptCode}: {proc.description}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="pt-4">
              <div className="space-y-6">
                {/* Claims Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.claims.length === 0 ? (
                      <p className="text-sm text-gray-500">No claims</p>
                    ) : (
                      <div className="space-y-3">
                        {patient.claims.map((claim) => (
                          <div
                            key={claim.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">Claim #{claim.claimNumber}</p>
                                <p className="text-sm text-gray-500">
                                  Service Date: {formatDate(claim.serviceDate, 'MMM d, yyyy')}
                                  {claim.insurancePlan && ` • ${claim.insurancePlan.payerName}`}
                                </p>
                              </div>
                              <Badge className={getStatusColor(claim.status)}>
                                {claim.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-gray-50 rounded">
                              <div>
                                <p className="text-xs text-gray-500">Charges</p>
                                <p className="font-medium">{formatCurrency(claim.totalCharges)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Paid</p>
                                <p className="font-medium text-green-600">{formatCurrency(claim.paidAmount || 0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Patient Resp.</p>
                                <p className="font-medium text-orange-600">{formatCurrency(claim.patientResponsibility || 0)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Patient Payments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.payments.length === 0 ? (
                      <p className="text-sm text-gray-500">No payments</p>
                    ) : (
                      <div className="space-y-2">
                        {patient.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between rounded-lg border px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(payment.date, 'MMM d, yyyy')} • {payment.method}
                                  {payment.reference && ` • Ref: ${payment.reference}`}
                                </p>
                              </div>
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-gray-500">{payment.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Upload
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.documents.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents</p>
                  ) : (
                    <div className="space-y-2">
                      {patient.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {doc.type.replace(/_/g, ' ')}
                                {doc.category && ` • ${doc.category}`}
                                {' • '}
                                {formatDate(doc.createdAt, 'MMM d, yyyy')}
                                {' • '}
                                {(doc.fileSize / 1024).toFixed(1)} KB
                              </p>
                              {doc.description && (
                                <p className="text-sm text-gray-500">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                            title={`Download ${doc.name}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
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
          {/* Insurance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Insurance</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {patient.insurances.length === 0 ? (
                <p className="text-sm text-gray-500">Self-Pay</p>
              ) : (
                <div className="space-y-3">
                  {patient.insurances.map((ins) => (
                    <div key={ins.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">
                          {ins.priority === 1 ? 'Primary' : 'Secondary'}
                        </Badge>
                        <Badge variant={ins.isVerified ? 'success' : 'warning'}>
                          {ins.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <p className="font-medium">{ins.insurancePlan.payerName}</p>
                      <p className="text-sm text-gray-500">{ins.insurancePlan.name}</p>
                      <p className="text-sm text-gray-500">ID: {ins.subscriberId}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.emergencyName ? (
                <div>
                  <p className="font-medium">{patient.emergencyName}</p>
                  {patient.emergencyRelation && (
                    <p className="text-sm text-gray-500">{patient.emergencyRelation}</p>
                  )}
                  {patient.emergencyPhone && (
                    <p className="text-sm">{formatPhone(patient.emergencyPhone)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not provided</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/billing/eligibility?patientId=${patient.id}`)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Verify Eligibility
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.print()
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Print Summary
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (patient.email) {
                    window.location.href = `mailto:${patient.email}?subject=Message from Mountain View Medical Center`
                  } else {
                    toast({
                      title: 'No Email Address',
                      description: 'This patient does not have an email address on file.',
                      variant: 'destructive',
                    })
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSaveCardOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </CardHeader>
            <CardContent>
              <PaymentMethodsList
                key={paymentMethodsKey}
                patientId={patient.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File *</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="docType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatDocumentType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the document"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false)
                  setSelectedFile(null)
                  setDocumentType('OTHER')
                  setDocumentDescription('')
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadDocument}
                disabled={uploading || !selectedFile}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Card Modal */}
      <SaveCardModal
        isOpen={isSaveCardOpen}
        onClose={() => setIsSaveCardOpen(false)}
        patientId={patient.id}
        onSuccess={() => {
          setPaymentMethodsKey(prev => prev + 1) // Refresh the payment methods list
          toast({
            title: 'Card saved',
            description: 'The payment method has been saved successfully.',
          })
        }}
      />
    </div>
  )
}
