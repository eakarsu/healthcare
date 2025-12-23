'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Calendar,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  TrendingDown,
  CheckCircle2,
  Loader2,
  User,
  RefreshCw,
  Calculator,
  UserCheck,
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  phone: string
  email: string
  appointments?: Array<{
    id: string
    status: string
    scheduledStart: string
  }>
}

interface PatientPrediction {
  patientName: string
  noShowProbability: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: Array<{ factor: string; impact: number }>
  historicalNoShows: number
  totalAppointments: number
  recommendations: string[]
}

interface AppointmentPrediction {
  id: string
  patientName: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  provider: string
  noShowProbability: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  suggestedActions: string[]
  lastConfirmation: string | null
}

export default function NoShowPredictorPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentPrediction[]>([])
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  // Patient prediction section
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [calculatingRisk, setCalculatingRisk] = useState(false)
  const [patientPrediction, setPatientPrediction] = useState<PatientPrediction | null>(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('follow-up')

  useEffect(() => {
    fetchPredictions()
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?include=appointments&limit=100')
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

  const calculatePatientRisk = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'No patient selected',
        description: 'Please select a patient to calculate no-show risk.',
        variant: 'destructive',
      })
      return
    }

    setCalculatingRisk(true)
    try {
      const response = await fetch('/api/ai/no-show-predictor/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          appointmentDate: appointmentDate || undefined,
          appointmentTime: appointmentTime || undefined,
          appointmentType,
        }),
      })

      if (!response.ok) throw new Error('Failed to calculate risk')

      const data = await response.json()
      setPatientPrediction(data)
      toast({
        title: 'Risk calculated',
        description: `No-show probability: ${data.noShowProbability}%`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to calculate no-show risk',
        variant: 'destructive',
      })
    } finally {
      setCalculatingRisk(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setPatientPrediction(null)
  }

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/no-show-predictor')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load predictions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const sendReminder = async (appointmentId: string, method: 'sms' | 'email' | 'call') => {
    setSendingReminder(appointmentId)
    try {
      await fetch('/api/ai/no-show-predictor/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, method }),
      })
      toast({
        title: 'Reminder sent',
        description: `${method.toUpperCase()} reminder has been sent to the patient`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      })
    } finally {
      setSendingReminder(null)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (probability: number) => {
    if (probability >= 70) return 'bg-red-500'
    if (probability >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const stats = {
    total: appointments.length,
    highRisk: appointments.filter(a => a.riskLevel === 'high').length,
    mediumRisk: appointments.filter(a => a.riskLevel === 'medium').length,
    confirmed: appointments.filter(a => a.lastConfirmation).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI No-Show Predictor</h1>
        <p className="text-gray-500">
          Predict appointment no-shows and take proactive action
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">High No-Show Risk</p>
                <p className="text-3xl font-bold text-red-700">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Medium Risk</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.mediumRisk}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Confirmed</p>
                <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Risk Calculator */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Individual Patient Risk Calculator
            </CardTitle>
            <CardDescription>
              Select a patient to calculate their no-show probability for a new appointment
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
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} ({patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Appointment Date (Optional)</Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Appointment Time (Optional)</Label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-patient">New Patient Visit</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  <SelectItem value="annual-wellness">Annual Wellness</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={calculatePatientRisk}
              disabled={calculatingRisk || !selectedPatientId}
            >
              {calculatingRisk ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate No-Show Risk
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Patient Prediction Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            {patientPrediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">No-Show Probability</p>
                    <p className="text-4xl font-bold">{patientPrediction.noShowProbability}%</p>
                  </div>
                  <Badge
                    className={`text-lg px-4 py-2 ${getRiskColor(patientPrediction.riskLevel)}`}
                  >
                    {patientPrediction.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Risk Level</span>
                    <span>{patientPrediction.noShowProbability}%</span>
                  </div>
                  <Progress value={patientPrediction.noShowProbability} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{patientPrediction.historicalNoShows}</p>
                    <p className="text-xs text-gray-500">Past No-Shows</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{patientPrediction.totalAppointments}</p>
                    <p className="text-xs text-gray-500">Total Appointments</p>
                  </div>
                </div>

                {patientPrediction.riskFactors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Risk Factors</p>
                    <div className="space-y-1">
                      {patientPrediction.riskFactors.map((rf, i) => (
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

                {patientPrediction.recommendations.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Recommendations</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {patientPrediction.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-gray-500">
                <UserCheck className="mb-4 h-12 w-12 text-gray-300" />
                <p>No patient selected</p>
                <p className="text-sm">Select a patient to calculate their no-show risk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Appointments - Risk Analysis</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchPredictions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Sorted by no-show probability. Take action on high-risk appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming appointments to analyze</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 rounded-lg border ${
                    apt.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
                    apt.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{apt.patientName}</span>
                        <Badge className={getRiskColor(apt.riskLevel)}>
                          {apt.noShowProbability}% No-Show Risk
                        </Badge>
                        {apt.lastConfirmation && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {apt.appointmentDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.appointmentTime}
                        </div>
                        <div>{apt.appointmentType}</div>
                        <div>Dr. {apt.provider}</div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>No-Show Probability</span>
                          <span>{apt.noShowProbability}%</span>
                        </div>
                        <Progress value={apt.noShowProbability} className="h-2" />
                      </div>

                      {apt.riskFactors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {apt.riskFactors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {apt.suggestedActions.length > 0 && (
                        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          <strong>Suggested:</strong> {apt.suggestedActions[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminder(apt.id, 'sms')}
                        disabled={sendingReminder === apt.id}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        SMS
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminder(apt.id, 'email')}
                        disabled={sendingReminder === apt.id}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminder(apt.id, 'call')}
                        disabled={sendingReminder === apt.id}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
