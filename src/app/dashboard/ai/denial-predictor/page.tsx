'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  insurances?: Array<{
    insurancePlan: { payerName: string }
  }>
  conditions?: Array<{ name: string; icdCode?: string }>
}

interface RiskFactor {
  factor: string
  impact: string
  recommendation: string
}

interface PredictionResult {
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: RiskFactor[]
  overallRecommendation: string
}

export default function DenialPredictorPage() {
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [formData, setFormData] = useState({
    diagnosis: '',
    procedures: '',
    insurance: '',
    totalCharges: '',
    placeOfService: '11',
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=insurances,conditions&limit=100')
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
      // Map insurance to dropdown values
      const insurancePlan = patient.insurances?.[0]?.insurancePlan?.payerName?.toLowerCase() || ''
      let mappedInsurance = ''
      if (insurancePlan.includes('aetna')) mappedInsurance = 'Aetna'
      else if (insurancePlan.includes('blue') || insurancePlan.includes('bcbs')) mappedInsurance = 'Blue Cross Blue Shield'
      else if (insurancePlan.includes('united')) mappedInsurance = 'UnitedHealthcare'
      else if (insurancePlan.includes('cigna')) mappedInsurance = 'Cigna'
      else if (insurancePlan.includes('humana')) mappedInsurance = 'Humana'
      else if (insurancePlan.includes('medicare')) mappedInsurance = 'Medicare'
      else if (insurancePlan.includes('medicaid')) mappedInsurance = 'Medicaid'

      // Get diagnosis codes from conditions
      const diagnosisCodes = patient.conditions
        ?.filter(c => c.icdCode)
        .map(c => c.icdCode)
        .join(', ') || ''

      setFormData(prev => ({
        ...prev,
        diagnosis: diagnosisCodes || prev.diagnosis,
        insurance: mappedInsurance || prev.insurance,
      }))
      toast({
        title: 'Patient data loaded',
        description: `Loaded information for ${patient.firstName} ${patient.lastName}`,
      })
    }
  }

  const analyzeRisk = async () => {
    if (!formData.diagnosis || !formData.procedures || !formData.insurance) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/denial-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: formData.diagnosis.split(',').map((d) => d.trim()),
          procedures: formData.procedures.split(',').map((p) => p.trim()),
          insurance: formData.insurance,
          totalCharges: parseFloat(formData.totalCharges) || 0,
          placeOfService: formData.placeOfService,
        }),
      })

      if (!response.ok) throw new Error('Failed to analyze risk')

      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze denial risk. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'HIGH':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'MEDIUM':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'LOW':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Denial Predictor</h1>
        <p className="text-gray-500">
          Analyze claim data to predict denial risk and get recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claim Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Claim Details
            </CardTitle>
            <CardDescription>
              Enter claim information to analyze denial risk
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

            <div className="border-t pt-4 space-y-2">
              <Label>Diagnosis Codes (ICD-10) *</Label>
              <Input
                placeholder="I10, E11.9, M54.5"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Separate multiple codes with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Procedure Codes (CPT) *</Label>
              <Input
                placeholder="99214, 93000, 71046"
                value={formData.procedures}
                onChange={(e) =>
                  setFormData({ ...formData, procedures: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Separate multiple codes with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Insurance Payer *</Label>
              <Select
                value={formData.insurance}
                onValueChange={(value) =>
                  setFormData({ ...formData, insurance: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicare">Medicare</SelectItem>
                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                  <SelectItem value="Blue Cross Blue Shield">
                    Blue Cross Blue Shield
                  </SelectItem>
                  <SelectItem value="Aetna">Aetna</SelectItem>
                  <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                  <SelectItem value="Cigna">Cigna</SelectItem>
                  <SelectItem value="Humana">Humana</SelectItem>
                  <SelectItem value="Other Commercial">Other Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Charges</Label>
              <Input
                type="number"
                placeholder="250.00"
                value={formData.totalCharges}
                onChange={(e) =>
                  setFormData({ ...formData, totalCharges: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Place of Service</Label>
              <Select
                value={formData.placeOfService}
                onValueChange={(value) =>
                  setFormData({ ...formData, placeOfService: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">Office</SelectItem>
                  <SelectItem value="21">Inpatient Hospital</SelectItem>
                  <SelectItem value="22">Outpatient Hospital</SelectItem>
                  <SelectItem value="23">Emergency Room</SelectItem>
                  <SelectItem value="02">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={analyzeRisk}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Analyze Risk
                </>
              )}
            </Button>

            {/* Quick Fill */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">Quick fill sample:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({
                    diagnosis: 'I10, E11.9, R07.9',
                    procedures: '99214, 93000',
                    insurance: 'Medicare',
                    totalCharges: '275',
                    placeOfService: '11',
                  })
                }
              >
                Use Sample Claim
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis Results */}
        <div className="space-y-4">
          {prediction ? (
            <>
              {/* Risk Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Denial Risk Score</p>
                      <p className="text-4xl font-bold">{prediction.riskScore}%</p>
                    </div>
                    <Badge
                      className={`text-lg px-4 py-2 ${getRiskColor(prediction.riskLevel)}`}
                    >
                      {prediction.riskLevel} RISK
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="h-4 rounded-full bg-gray-200">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          prediction.riskLevel === 'LOW'
                            ? 'bg-green-500'
                            : prediction.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.riskScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  {prediction.riskFactors.length > 0 ? (
                    <div className="space-y-3">
                      {prediction.riskFactors.map((factor, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            {getImpactIcon(factor.impact)}
                            <div className="flex-1">
                              <p className="font-medium">{factor.factor}</p>
                              <Badge
                                variant="outline"
                                className="text-xs mt-1"
                              >
                                {factor.impact} Impact
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 pl-6">
                            <span className="font-medium">Recommendation: </span>
                            {factor.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No significant risk factors identified
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Overall Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{prediction.overallRecommendation}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex h-[400px] flex-col items-center justify-center text-gray-500">
                <Shield className="mb-4 h-12 w-12 text-gray-300" />
                <p>No analysis yet</p>
                <p className="text-sm">Enter claim details to analyze denial risk</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
