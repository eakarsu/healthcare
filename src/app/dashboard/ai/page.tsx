'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  Calculator,
  AlertTriangle,
  Brain,
  ArrowRight,
  Sparkles,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Activity,
  CalendarX,
  Lightbulb,
  Pill,
  Send,
} from 'lucide-react'

const aiFeatures = [
  {
    title: 'AI Medical Scribe',
    description: 'Convert voice recordings into structured SOAP notes. Save hours of documentation time.',
    href: '/ai/scribe',
    icon: Mic,
    color: 'bg-blue-100 text-blue-600',
    features: ['Voice-to-text transcription', 'SOAP note generation', 'Chief complaint extraction'],
  },
  {
    title: 'AI Billing Coder',
    description: 'Auto-suggest ICD-10 and CPT codes from clinical documentation.',
    href: '/ai/billing-coder',
    icon: Calculator,
    color: 'bg-green-100 text-green-600',
    features: ['ICD-10 suggestions', 'CPT recommendations', 'Coding compliance'],
  },
  {
    title: 'Denial Risk Predictor',
    description: 'Predict claim denial risk before submission and prevent revenue loss.',
    href: '/ai/denial-predictor',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-600',
    features: ['Pre-submission analysis', 'Risk scoring', 'Prevention tips'],
  },
  {
    title: 'Prior Auth Assistant',
    description: 'Automate prior authorization requests with AI-generated documentation.',
    href: '/ai/prior-auth',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-600',
    features: ['Auto-generate letters', 'Track status', 'Requirements checklist'],
  },
  {
    title: 'Patient Risk Stratification',
    description: 'Identify high-risk patients and prioritize care interventions.',
    href: '/ai/risk-stratification',
    icon: Activity,
    color: 'bg-red-100 text-red-600',
    features: ['Risk scoring', 'Care gap alerts', 'Outreach recommendations'],
  },
  {
    title: 'No-Show Predictor',
    description: 'Predict appointment no-shows and take proactive action.',
    href: '/ai/no-show-predictor',
    icon: CalendarX,
    color: 'bg-yellow-100 text-yellow-600',
    features: ['Risk analysis', 'Smart reminders', 'Overbooking suggestions'],
  },
  {
    title: 'Treatment Recommendations',
    description: 'Get evidence-based treatment suggestions from clinical guidelines.',
    href: '/ai/treatment-recommendations',
    icon: Lightbulb,
    color: 'bg-teal-100 text-teal-600',
    features: ['Guideline-based', 'Medication options', 'Follow-up plans'],
  },
  {
    title: 'Drug Interaction Checker',
    description: 'Check for potential drug-drug interactions and safety alerts.',
    href: '/ai/drug-interactions',
    icon: Pill,
    color: 'bg-pink-100 text-pink-600',
    features: ['Interaction analysis', 'Severity scoring', 'Alternative suggestions'],
  },
  {
    title: 'Referral Letter Generator',
    description: 'Generate professional referral letters with AI assistance.',
    href: '/ai/referral-letter',
    icon: Send,
    color: 'bg-indigo-100 text-indigo-600',
    features: ['Auto-formatting', 'Clinical summary', 'Fax integration'],
  },
]

const stats = [
  { label: 'Documentation Time Saved', value: '50%', icon: FileText },
  { label: 'Coding Accuracy', value: '+35%', icon: DollarSign },
  { label: 'Denial Rate Reduction', value: '42%', icon: TrendingUp },
]

export default function AIPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Features</h1>
          <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            9 Features
          </Badge>
        </div>
        <p className="text-gray-500 max-w-2xl">
          Leverage artificial intelligence to streamline clinical documentation, optimize billing,
          predict risks, and enhance patient care with evidence-based recommendations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-full">
                  <stat.icon className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aiFeatures.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription className="text-sm">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <ul className="space-y-1 mb-4 flex-1">
                {feature.features.map((item) => (
                  <li key={item} className="flex items-center text-xs text-gray-600">
                    <div className="w-1 h-1 bg-teal-500 rounded-full mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="sm" className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 group-hover:bg-teal-700">
                <Link href={feature.href}>
                  Open
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Our AI Works</CardTitle>
          <CardDescription>
            HIPAA-compliant AI processing with medical-grade accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-teal-600 font-semibold">1</span>
              </div>
              <h4 className="font-medium mb-1">Input Data</h4>
              <p className="text-sm text-gray-500">
                Enter clinical notes, voice, or patient data
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-teal-600 font-semibold">2</span>
              </div>
              <h4 className="font-medium mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-500">
                Medical AI processes and understands context
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-teal-600 font-semibold">3</span>
              </div>
              <h4 className="font-medium mb-1">Generate Results</h4>
              <p className="text-sm text-gray-500">
                Receive notes, codes, predictions, or letters
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-teal-600 font-semibold">4</span>
              </div>
              <h4 className="font-medium mb-1">Review & Apply</h4>
              <p className="text-sm text-gray-500">
                Review AI output and integrate into workflow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">HIPAA Compliant AI</h4>
              <p className="text-sm text-blue-700 mt-1">
                All AI processing is done securely with full HIPAA compliance. Patient data is encrypted
                in transit and at rest, and no PHI is used for model training. Your data stays private.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
