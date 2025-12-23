'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  FileText,
  Download,
  Activity,
  Pill,
  AlertTriangle,
  Heart,
  Stethoscope,
  Calendar,
  ChevronRight,
  FlaskConical,
  Syringe,
} from 'lucide-react'
import { format } from 'date-fns'

interface LabResult {
  id: string
  name: string
  date: string
  status: 'normal' | 'abnormal' | 'critical'
  results: Array<{
    test: string
    value: string
    unit: string
    range: string
    flag?: string
  }>
}

interface Visit {
  id: string
  date: string
  provider: string
  type: string
  diagnosis: string[]
  summary: string
}

export default function PortalRecordsPage() {
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null)

  // Mock patient data
  const patientInfo = {
    name: 'John Smith',
    dob: '1985-03-15',
    mrn: 'MRN-12345',
    bloodType: 'O+',
    height: '5\'10"',
    weight: '180 lbs',
  }

  const allergies = [
    { name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' },
    { name: 'Shellfish', severity: 'moderate', reaction: 'Hives' },
  ]

  const medications = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Wilson' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Wilson' },
    { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', prescribedBy: 'Dr. Wilson' },
  ]

  const conditions = [
    { name: 'Essential Hypertension', code: 'I10', status: 'active', since: '2020' },
    { name: 'Type 2 Diabetes Mellitus', code: 'E11.9', status: 'active', since: '2021' },
    { name: 'Hyperlipidemia', code: 'E78.5', status: 'active', since: '2020' },
  ]

  const immunizations = [
    { name: 'COVID-19 Vaccine (Pfizer)', date: '2024-09-15', nextDue: null },
    { name: 'Influenza Vaccine', date: '2024-10-01', nextDue: '2025-10-01' },
    { name: 'Tdap', date: '2022-05-10', nextDue: '2032-05-10' },
    { name: 'Hepatitis B', date: '2010-03-15', nextDue: null },
  ]

  const labResults: LabResult[] = [
    {
      id: '1',
      name: 'Comprehensive Metabolic Panel',
      date: '2024-11-15',
      status: 'normal',
      results: [
        { test: 'Glucose', value: '95', unit: 'mg/dL', range: '70-100' },
        { test: 'BUN', value: '15', unit: 'mg/dL', range: '7-20' },
        { test: 'Creatinine', value: '1.0', unit: 'mg/dL', range: '0.7-1.3' },
        { test: 'Sodium', value: '140', unit: 'mEq/L', range: '136-145' },
        { test: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5-5.0' },
      ],
    },
    {
      id: '2',
      name: 'Lipid Panel',
      date: '2024-11-15',
      status: 'abnormal',
      results: [
        { test: 'Total Cholesterol', value: '220', unit: 'mg/dL', range: '<200', flag: 'H' },
        { test: 'LDL', value: '145', unit: 'mg/dL', range: '<100', flag: 'H' },
        { test: 'HDL', value: '45', unit: 'mg/dL', range: '>40' },
        { test: 'Triglycerides', value: '150', unit: 'mg/dL', range: '<150' },
      ],
    },
    {
      id: '3',
      name: 'HbA1c',
      date: '2024-11-15',
      status: 'normal',
      results: [
        { test: 'HbA1c', value: '6.5', unit: '%', range: '<7.0' },
      ],
    },
  ]

  const visits: Visit[] = [
    {
      id: '1',
      date: '2024-11-15',
      provider: 'Dr. Sarah Wilson',
      type: 'Follow-up Visit',
      diagnosis: ['Hypertension', 'Type 2 Diabetes'],
      summary: 'Patient presents for routine follow-up. Blood pressure well controlled on current medication. A1c improved from last visit.',
    },
    {
      id: '2',
      date: '2024-08-20',
      provider: 'Dr. Sarah Wilson',
      type: 'Annual Physical',
      diagnosis: ['Annual Wellness Visit'],
      summary: 'Comprehensive annual examination. All screenings up to date. Discussed diet and exercise.',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'mild':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500">View your health information</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Records
        </Button>
      </div>

      {/* Patient Summary Card */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{patientInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{format(new Date(patientInfo.dob), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">MRN</p>
              <p className="font-medium">{patientInfo.mrn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="font-medium">{patientInfo.bloodType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Height</p>
              <p className="font-medium">{patientInfo.height}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-medium">{patientInfo.weight}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allergies.length === 0 ? (
                <p className="text-gray-500">No known allergies</p>
              ) : (
                <div className="space-y-3">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{allergy.name}</p>
                        <p className="text-sm text-gray-500">Reaction: {allergy.reaction}</p>
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

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-blue-500" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className="text-gray-500">No current medications</p>
              ) : (
                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{med.name}</p>
                        <Badge variant="outline">{med.dosage}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {med.frequency} • Prescribed by {med.prescribedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-red-500" />
                Health Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conditions.length === 0 ? (
                <p className="text-gray-500">No active conditions</p>
              ) : (
                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{condition.name}</p>
                        <p className="text-sm text-gray-500">
                          ICD-10: {condition.code} • Since {condition.since}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{condition.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-purple-500" />
                Recent Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {labResults.map((lab) => (
                  <AccordionItem key={lab.id} value={lab.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <p className="font-medium">{lab.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(lab.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(lab.status)}>{lab.status}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Test</th>
                              <th className="text-left py-2">Result</th>
                              <th className="text-left py-2">Range</th>
                              <th className="text-left py-2">Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lab.results.map((result, idx) => (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="py-2">{result.test}</td>
                                <td className="py-2">
                                  {result.value} {result.unit}
                                </td>
                                <td className="py-2 text-gray-500">{result.range}</td>
                                <td className="py-2">
                                  {result.flag && (
                                    <Badge variant="outline" className="text-red-600 border-red-300">
                                      {result.flag}
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-500" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="p-4 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {format(new Date(visit.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{visit.type}</p>
                        <p className="text-sm text-gray-500">{visit.provider}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {visit.diagnosis.map((dx, idx) => (
                        <Badge key={idx} variant="outline">{dx}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{visit.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-green-500" />
                Immunization Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {immunizations.map((imm, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{imm.name}</p>
                      <p className="text-sm text-gray-500">
                        Administered: {format(new Date(imm.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {imm.nextDue ? (
                      <Badge variant="outline">
                        Next due: {format(new Date(imm.nextDue), 'MMM yyyy')}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Up to date</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
