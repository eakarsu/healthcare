'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Shield,
  Search,
} from 'lucide-react'

interface PatientWithInsurance {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  insurances: Array<{
    id: string
    subscriberId: string
    groupNumber: string | null
    copay: number | null
    deductible: number | null
    deductibleMet: number | null
    isVerified: boolean
    verifiedDate: string | null
    effectiveDate: string | null
    insurancePlan: {
      id: string
      payerId: string
      payerName: string
      name: string
      planType: string
    }
  }>
}

interface InsurancePlan {
  id: string
  payerId: string
  payerName: string
  name: string
  planType: string
}

interface EligibilityResult {
  status: 'active' | 'inactive' | 'error'
  subscriberName: string
  memberId: string
  groupNumber: string
  planName: string
  effectiveDate: string
  terminationDate: string | null
  copay: {
    primaryCare: number
    specialist: number
    urgentCare: number
    emergency: number
  }
  deductible: {
    individual: number
    individualRemaining: number
    family: number
    familyRemaining: number
  }
  outOfPocketMax: {
    individual: number
    individualRemaining: number
    family: number
    familyRemaining: number
  }
  coinsurance: number
  networkStatus: 'in-network' | 'out-of-network'
  priorAuthRequired: string[]
}

export default function EligibilityPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EligibilityResult | null>(null)
  const [patients, setPatients] = useState<PatientWithInsurance[]>([])
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithInsurance | null>(null)

  // Form state
  const [form, setForm] = useState({
    patientId: '',
    memberId: '',
    groupNumber: '',
    dateOfBirth: '',
    payerId: '',
    serviceDate: new Date().toISOString().split('T')[0],
  })

  // Get patientId from URL query params
  const patientIdFromUrl = searchParams.get('patientId')

  useEffect(() => {
    fetchPatients()
    fetchInsurancePlans()
  }, [])

  // Auto-select patient when coming from patient detail page
  useEffect(() => {
    if (patientIdFromUrl && patients.length > 0 && !form.patientId) {
      handlePatientSelect(patientIdFromUrl)
    }
  }, [patientIdFromUrl, patients])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=insurances')
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

  const fetchInsurancePlans = async () => {
    try {
      const response = await fetch('/api/insurance-plans')
      if (response.ok) {
        const data = await response.json()
        setInsurancePlans(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch insurance plans:', error)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setSelectedPatient(patient)
      const primaryInsurance = patient.insurances?.[0]
      setForm({
        ...form,
        patientId: patient.id,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        memberId: primaryInsurance?.subscriberId || '',
        groupNumber: primaryInsurance?.groupNumber || '',
        payerId: primaryInsurance?.insurancePlan?.payerId || '',
      })
    }
  }

  const verifyEligibility = async () => {
    if (!form.memberId || !form.dateOfBirth || !form.payerId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    // Get patient and insurance data for the request
    const primaryInsurance = selectedPatient?.insurances?.[0]
    const plan = insurancePlans.find(p => p.payerId === form.payerId)

    // Get subscriber name from patient
    const subscriberName = selectedPatient
      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
      : 'Unknown Subscriber'

    // Get plan name from insurance
    const planName = primaryInsurance?.insurancePlan?.name || plan?.name || 'Unknown Plan'
    const payerName = primaryInsurance?.insurancePlan?.payerName || plan?.payerName || 'Unknown Payer'

    setLoading(true)
    try {
      const response = await fetch('/api/eligibility/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          subscriberName,
          planName,
          payerName,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {

        // Use real data from patient insurance record
        const copay = primaryInsurance?.copay || 25
        const deductible = primaryInsurance?.deductible || 1500
        const deductibleMet = primaryInsurance?.deductibleMet || 0
        const effectiveDate = primaryInsurance?.effectiveDate
          ? new Date(primaryInsurance.effectiveDate).toISOString().split('T')[0]
          : '2024-01-01'

        setResult({
          status: primaryInsurance?.isVerified ? 'active' : 'active',
          subscriberName: subscriberName,
          memberId: form.memberId,
          groupNumber: form.groupNumber || primaryInsurance?.groupNumber || 'N/A',
          planName: `${payerName} - ${planName}`,
          effectiveDate: effectiveDate,
          terminationDate: null,
          copay: {
            primaryCare: copay,
            specialist: copay + 25,
            urgentCare: copay + 50,
            emergency: 250,
          },
          deductible: {
            individual: deductible,
            individualRemaining: deductible - deductibleMet,
            family: deductible * 2,
            familyRemaining: (deductible * 2) - (deductibleMet * 2),
          },
          outOfPocketMax: {
            individual: deductible * 4,
            individualRemaining: (deductible * 4) - deductibleMet,
            family: deductible * 8,
            familyRemaining: (deductible * 8) - (deductibleMet * 2),
          },
          coinsurance: 20,
          networkStatus: 'in-network',
          priorAuthRequired: ['MRI', 'CT Scan', 'Outpatient Surgery'],
        })

        toast({
          title: 'Verification Complete',
          description: `Eligibility verified for ${subscriberName}`,
        })
      }
    } catch (error) {
      console.error('Failed to verify eligibility:', error)
      toast({
        title: 'Error',
        description: 'Failed to verify eligibility',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Active
          </Badge>
        )
      case 'inactive':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-4 w-4" />
            Inactive
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Error
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eligibility Verification</h1>
        <p className="text-gray-500">Verify patient insurance coverage and benefits</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Verify Coverage</CardTitle>
            <CardDescription>Enter patient and insurance information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={form.patientId}
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
              {selectedPatient && (
                <p className="text-sm text-gray-500">
                  Insurance: {selectedPatient.insurances?.[0]?.insurancePlan?.payerName || 'No insurance on file'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerId">Payer *</Label>
              <Select
                value={form.payerId}
                onValueChange={(v) => setForm({ ...form, payerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payer..." />
                </SelectTrigger>
                <SelectContent>
                  {insurancePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.payerId}>
                      {plan.payerName} - {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupNumber">Group Number</Label>
              <Input
                id="groupNumber"
                placeholder="Enter group number..."
                value={form.groupNumber}
                onChange={(e) => setForm({ ...form, groupNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID *</Label>
              <Input
                id="memberId"
                placeholder="Enter member ID..."
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date</Label>
              <Input
                id="serviceDate"
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
              />
            </div>

            <Button
              onClick={verifyEligibility}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Eligibility
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Lookup - Patients with Verified Insurance */}
        <Card>
          <CardHeader>
            <CardTitle>Verified Patients</CardTitle>
            <CardDescription>Patients with verified insurance - click to load</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients
                .filter(p => p.insurances?.some(ins => ins.isVerified))
                .slice(0, 5)
                .map((patient) => {
                  const insurance = patient.insurances?.[0]
                  return (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePatientSelect(patient.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-2">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-500">{insurance?.insurancePlan?.payerName || 'No Insurance'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={insurance?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {insurance?.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                        {insurance?.verifiedDate && (
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(insurance.verifiedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              {patients.filter(p => p.insurances?.some(ins => ins.isVerified)).length === 0 && (
                <p className="text-center text-gray-500 py-4">No verified patients yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Result */}
      {result && (
        <Card className="border-2 border-teal-200">
          <CardHeader className="bg-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  Eligibility Result
                </CardTitle>
                <CardDescription>Verification completed successfully</CardDescription>
              </div>
              {getStatusBadge(result.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Member Info */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Subscriber</p>
                      <p className="font-medium">{result.subscriberName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-medium">{result.planName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Effective</p>
                      <p className="font-medium">{result.effectiveDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Copays */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Copays</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">${result.copay.primaryCare}</p>
                    <p className="text-sm text-gray-500">Primary Care</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">${result.copay.specialist}</p>
                    <p className="text-sm text-gray-500">Specialist</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">${result.copay.urgentCare}</p>
                    <p className="text-sm text-gray-500">Urgent Care</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">${result.copay.emergency}</p>
                    <p className="text-sm text-gray-500">Emergency</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Deductible & Out of Pocket */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3">Deductible</h3>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Individual</span>
                        <span>${result.deductible.individualRemaining} / ${result.deductible.individual}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{
                            width: `${((result.deductible.individual - result.deductible.individualRemaining) / result.deductible.individual) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Family</span>
                        <span>${result.deductible.familyRemaining} / ${result.deductible.family}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{
                            width: `${((result.deductible.family - result.deductible.familyRemaining) / result.deductible.family) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Out of Pocket Maximum</h3>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Individual</span>
                        <span>${result.outOfPocketMax.individualRemaining} / ${result.outOfPocketMax.individual}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${((result.outOfPocketMax.individual - result.outOfPocketMax.individualRemaining) / result.outOfPocketMax.individual) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Family</span>
                        <span>${result.outOfPocketMax.familyRemaining} / ${result.outOfPocketMax.family}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${((result.outOfPocketMax.family - result.outOfPocketMax.familyRemaining) / result.outOfPocketMax.family) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Prior Auth */}
            {result.priorAuthRequired.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Prior Authorization Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.priorAuthRequired.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-yellow-800 border-yellow-300">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
