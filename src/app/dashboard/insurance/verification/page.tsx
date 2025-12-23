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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
}

interface VerificationHistory {
  id: string
  date: string
  patientName: string
  insurancePlan: string
  status: string
  isEligible: boolean
  verifiedBy: string
}

export default function InsuranceVerificationPage() {
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [history, setHistory] = useState<VerificationHistory[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    if (patientSearch.length >= 2) {
      searchPatients()
    } else {
      setPatients([])
    }
  }, [patientSearch])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/eligibility/history?limit=20')
      const data = await response.json()
      setHistory(data.data || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async () => {
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`)
      const data = await response.json()
      setPatients(data.data || [])
    } catch (error) {
      console.error('Failed to search patients:', error)
    }
  }

  const verifyEligibility = async () => {
    if (!selectedPatient) {
      toast({
        title: 'Select a patient',
        description: 'Please select a patient to verify eligibility',
        variant: 'destructive',
      })
      return
    }

    setVerifying(true)
    try {
      const response = await fetch('/api/eligibility/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: selectedPatient.id }),
      })
      const data = await response.json()

      if (response.ok) {
        setVerificationResult(data)
        toast({
          title: 'Verification complete',
          description: data.isEligible
            ? 'Patient is eligible for coverage'
            : 'Patient may not be eligible - please review details',
        })
        fetchHistory()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message || 'Failed to verify eligibility',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Insurance Verification</h1>
        <p className="text-gray-500">Verify patient insurance eligibility and coverage</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              Verify Eligibility
            </CardTitle>
            <CardDescription>
              Search for a patient and verify their insurance coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
                    <p className="text-sm text-gray-600">
                      DOB: {format(parseISO(selectedPatient.dateOfBirth), 'MM/dd/yyyy')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or MRN..."
                    className="pl-10"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                {patients.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-md border">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-0"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setPatientSearch('')
                          setPatients([])
                        }}
                      >
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          MRN: {patient.mrn} | DOB: {format(parseISO(patient.dateOfBirth), 'MM/dd/yyyy')}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={verifyEligibility}
              disabled={!selectedPatient || verifying}
            >
              {verifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Eligibility
                </>
              )}
            </Button>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-4 rounded-lg border ${
                verificationResult.isEligible
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {verificationResult.isEligible ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Eligible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Not Eligible</span>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance:</span>
                    <span className="font-medium">{verificationResult.insuranceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan Type:</span>
                    <span>{verificationResult.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Copay:</span>
                    <span>${verificationResult.copay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductible:</span>
                    <span>${verificationResult.deductible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductible Met:</span>
                    <span>${verificationResult.deductibleMet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective Date:</span>
                    <span>{verificationResult.effectiveDate}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Recent Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>No verification history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.patientName}</p>
                      <p className="text-sm text-gray-500">{item.insurancePlan}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge className={item.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.isEligible ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
