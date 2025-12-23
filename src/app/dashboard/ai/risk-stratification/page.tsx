'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Search,
  Users,
  AlertTriangle,
  TrendingUp,
  Heart,
  Activity,
  Loader2,
  ChevronRight,
  Filter,
  User,
  Calculator,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
}

interface PatientRisk {
  id: string
  name: string
  mrn: string
  age: number
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  riskFactors: string[]
  conditions: string[]
  lastVisit: string
  recommendedActions: string[]
}

interface IndividualRiskResult {
  patientName: string
  age: number
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  riskFactors: Array<{ factor: string; impact: number }>
  conditions: string[]
  medications: string[]
  recommendedActions: string[]
  lastVisit: string
}

export default function RiskStratificationPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<PatientRisk[]>([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<PatientRisk | null>(null)

  // Individual patient risk analysis
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [calculatingRisk, setCalculatingRisk] = useState(false)
  const [individualRisk, setIndividualRisk] = useState<IndividualRiskResult | null>(null)

  useEffect(() => {
    fetchPatientRisks()
    fetchAllPatients()
  }, [])

  const fetchAllPatients = async () => {
    try {
      const response = await fetch('/api/patients?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAllPatients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setIndividualRisk(null)
  }

  const calculateIndividualRisk = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'No patient selected',
        description: 'Please select a patient to analyze.',
        variant: 'destructive',
      })
      return
    }

    setCalculatingRisk(true)
    try {
      const response = await fetch('/api/ai/risk-stratification/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: selectedPatientId }),
      })

      if (!response.ok) throw new Error('Failed to analyze risk')

      const data = await response.json()
      setIndividualRisk(data)
      toast({
        title: 'Risk analysis complete',
        description: `Risk score: ${data.riskScore}% (${data.riskLevel.toUpperCase()})`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze patient risk',
        variant: 'destructive',
      })
    } finally {
      setCalculatingRisk(false)
    }
  }

  const fetchPatientRisks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/risk-stratification')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patient risk data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskProgressColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'moderate': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = riskFilter === 'all' || p.riskLevel === riskFilter
    return matchesSearch && matchesFilter
  })

  const riskCounts = {
    critical: patients.filter(p => p.riskLevel === 'critical').length,
    high: patients.filter(p => p.riskLevel === 'high').length,
    moderate: patients.filter(p => p.riskLevel === 'moderate').length,
    low: patients.filter(p => p.riskLevel === 'low').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Patient Risk Stratification</h1>
        <p className="text-gray-500">
          Identify high-risk patients and prioritize care interventions
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical Risk</p>
                <p className="text-3xl font-bold text-red-700">{riskCounts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">High Risk</p>
                <p className="text-3xl font-bold text-orange-700">{riskCounts.high}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Moderate Risk</p>
                <p className="text-3xl font-bold text-yellow-700">{riskCounts.moderate}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Low Risk</p>
                <p className="text-3xl font-bold text-green-700">{riskCounts.low}</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Patient Risk Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Individual Patient Risk Analysis
            </CardTitle>
            <CardDescription>
              Select a patient to get AI-powered risk stratification analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <SelectValue placeholder={loadingPatients ? "Loading..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {allPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} ({patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={calculateIndividualRisk}
              disabled={calculatingRisk || !selectedPatientId}
            >
              {calculatingRisk ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Analyze Patient Risk
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Individual Risk Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {individualRisk ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{individualRisk.patientName}</p>
                    <p className="text-sm text-gray-500">Age: {individualRisk.age}</p>
                  </div>
                  <Badge
                    className={`text-lg px-4 py-2 ${getRiskColor(individualRisk.riskLevel)}`}
                  >
                    {individualRisk.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="font-bold text-xl">{individualRisk.riskScore}%</span>
                  </div>
                  <Progress value={individualRisk.riskScore} className="h-3" />
                </div>

                {individualRisk.riskFactors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Risk Factors</p>
                    <div className="space-y-1">
                      {individualRisk.riskFactors.map((rf, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span>{rf.factor}</span>
                          <Badge variant="outline" className={rf.impact > 15 ? 'text-red-600' : rf.impact > 10 ? 'text-yellow-600' : 'text-gray-600'}>
                            +{rf.impact}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {individualRisk.conditions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {individualRisk.conditions.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {individualRisk.recommendedActions.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Recommended Actions</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {individualRisk.recommendedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500">Last Visit: {individualRisk.lastVisit}</p>
              </div>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center text-gray-500">
                <Activity className="mb-4 h-12 w-12 text-gray-300" />
                <p>No patient selected</p>
                <p className="text-sm">Select a patient to analyze their risk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Patients Risk Overview
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchPatientRisks}>
                  Refresh
                </Button>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Filter by name or MRN..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{patient.name}</p>
                            <Badge className={getRiskColor(patient.riskLevel)}>
                              {patient.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            MRN: {patient.mrn} | Age: {patient.age}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Risk Score</p>
                            <p className="text-lg font-bold">{patient.riskScore}%</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress
                          value={patient.riskScore}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg">{selectedPatient.name}</h3>
                    <p className="text-sm text-gray-500">MRN: {selectedPatient.mrn}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRiskColor(selectedPatient.riskLevel)}>
                        {selectedPatient.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <span className="text-2xl font-bold">{selectedPatient.riskScore}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.riskFactors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Active Conditions</p>
                    <ul className="space-y-1">
                      {selectedPatient.conditions.map((condition, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2" />
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</p>
                    <ul className="space-y-2">
                      {selectedPatient.recommendedActions.map((action, i) => (
                        <li key={i} className="text-sm p-2 bg-blue-50 rounded border border-blue-100 text-blue-800">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Last Visit: {selectedPatient.lastVisit}
                    </p>
                  </div>

                  <Button className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                    Schedule Outreach
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a patient to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
