import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Receipt,
  PieChart,
  Building,
} from 'lucide-react'

const capabilities = [
  {
    title: 'Insurance Verification',
    description: 'Real-time eligibility and benefits verification before every patient visit.',
    icon: FileCheck,
    features: [
      'Real-time eligibility checking',
      'Benefits breakdown display',
      'Copay and deductible lookup',
      'Prior auth requirements check',
      'Coverage effective dates',
      'Batch eligibility verification',
    ],
  },
  {
    title: 'Claims Management',
    description: 'End-to-end claims processing from charge capture to payment posting.',
    icon: Receipt,
    features: [
      'Automated charge capture',
      'AI-powered claim scrubbing',
      'Electronic claims submission',
      'Claim status tracking',
      'ERA/EOB auto-posting',
      'Secondary claims processing',
    ],
  },
  {
    title: 'Denial Management',
    description: 'Comprehensive tools to work denials and maximize collections.',
    icon: RefreshCw,
    features: [
      'Denial reason analysis',
      'Appeal letter templates',
      'Resubmission workflow',
      'Denial trending reports',
      'Payer-specific rules',
      'Automatic follow-up reminders',
    ],
  },
  {
    title: 'Patient Payments',
    description: 'Collect patient balances efficiently with multiple payment options.',
    icon: CreditCard,
    features: [
      'Online patient payments',
      'Payment plan setup',
      'Credit card processing',
      'ACH/eCheck payments',
      'Automatic payment posting',
      'Patient statements',
    ],
  },
]

const integrations = [
  'Availity',
  'Change Healthcare',
  'Trizetto',
  'Stripe',
  'All Major Clearinghouses',
  'All Major Payers',
]

const stats = [
  { value: '98%', label: 'Clean Claim Rate' },
  { value: '15 Days', label: 'Faster Payment' },
  { value: '50%', label: 'Fewer Denials' },
  { value: '$50K+', label: 'Annual Savings' },
]

export default function BillingModulePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Module</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Billing Module</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            End-to-end revenue cycle management from charge capture to payment posting. Maximize your revenue with intelligent automation and comprehensive analytics.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-green-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Billing Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Billing Module in Healthcare Practice Management?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                A <strong>Billing Module</strong> (also called Revenue Cycle Management or RCM) is the component of a practice management system that handles all financial operations from the moment a patient schedules an appointment until final payment is collected. It automates the complex process of getting paid for healthcare services.
              </p>
              <p>
                The Billing Module is critical for healthcare practice financial health because it manages:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Insurance Eligibility Verification:</strong> Confirms patient insurance coverage, benefits, copays, deductibles, and prior authorization requirements before services are rendered to prevent claim denials.</li>
                <li><strong>Charge Capture:</strong> Automatically captures charges from clinical documentation with appropriate CPT procedure codes and ICD-10 diagnosis codes to ensure complete and accurate billing.</li>
                <li><strong>Claim Scrubbing:</strong> Reviews claims for errors, missing information, coding issues, and compliance problems before submission to maximize clean claim rates.</li>
                <li><strong>Electronic Claims Submission:</strong> Transmits claims electronically to insurance payers through clearinghouses using the ANSI X12 837P format for faster processing.</li>
                <li><strong>Payment Posting:</strong> Automatically posts insurance payments from Electronic Remittance Advice (ERA/835) files and applies contractual adjustments based on payer contracts.</li>
                <li><strong>Denial Management:</strong> Tracks denied claims, identifies patterns, generates appeal letters, and manages the resubmission process to recover lost revenue.</li>
                <li><strong>Patient Collections:</strong> Generates patient statements, offers online payment options, sets up payment plans, and manages collection workflows for patient balances.</li>
                <li><strong>Financial Reporting:</strong> Provides dashboards and reports for accounts receivable aging, payer performance, denial rates, collection rates, and other key financial metrics.</li>
              </ul>
              <p>
                PracticeFlux Billing Module automates and optimizes every step of the revenue cycle, helping practices achieve 98%+ clean claim rates, reduce days in AR by 15+, and increase overall collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Verification Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-Time Insurance Eligibility Verification</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Insurance verification is the first and most critical step in the revenue cycle. Verifying eligibility before the patient visit prevents billing surprises and claim denials.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Batch Verification:</strong> Automatically verify eligibility for all patients scheduled in the coming days. Identify coverage issues before patients arrive.</li>
                <li><strong>Real-Time Lookup:</strong> Check eligibility instantly at patient check-in to confirm coverage is still active and get current benefit information.</li>
                <li><strong>Benefits Display:</strong> See detailed benefits including copay amounts, deductible status, coinsurance percentages, and out-of-pocket maximums.</li>
                <li><strong>Prior Authorization:</strong> Identify services requiring prior authorization and initiate the authorization process before the visit.</li>
                <li><strong>Multiple Payer Check:</strong> Verify coverage across multiple insurance plans when patients have primary and secondary coverage.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Claims Management Explained */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Intelligent Claims Management</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                From charge capture to payment posting, PracticeFlux automates the entire claims process while providing complete visibility and control.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Automated Charge Capture:</strong> Charges are automatically created from encounter documentation with AI-suggested CPT and ICD-10 codes based on the clinical findings.</li>
                <li><strong>AI-Powered Claim Scrubbing:</strong> Every claim is reviewed for coding errors, missing information, modifier issues, medical necessity, and payer-specific rules before submission.</li>
                <li><strong>Electronic Submission:</strong> Claims are submitted electronically to all major payers through integrated clearinghouse connections for faster processing.</li>
                <li><strong>Status Tracking:</strong> Track claim status in real-time from submission through adjudication. See when claims are received, processed, and paid.</li>
                <li><strong>ERA Auto-Posting:</strong> Electronic remittance advice (ERA/835) files are automatically downloaded and payments posted to patient accounts with contractual adjustments applied.</li>
                <li><strong>Secondary Claims:</strong> Automatically generate and submit secondary claims when primary insurance processes, including proper coordination of benefits.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Denial Management Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Denial Management and Appeals</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Denied claims represent lost revenue. PracticeFlux provides comprehensive tools to work denials efficiently and recover the maximum amount.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Denial Categorization:</strong> Denials are automatically categorized by reason code (eligibility, authorization, coding, medical necessity, etc.) for efficient workflows.</li>
                <li><strong>Appeal Letter Generation:</strong> Generate customized appeal letters with supporting documentation for each denial type. Templates are payer-specific for higher success rates.</li>
                <li><strong>Pattern Analysis:</strong> Identify denial patterns by payer, provider, service type, or diagnosis to address root causes and prevent future denials.</li>
                <li><strong>Work Queue Management:</strong> Prioritize denials by dollar amount and timely filing deadlines. Assign to team members and track progress.</li>
                <li><strong>Resubmission Tracking:</strong> Track corrected claims and appeals through the process. Monitor outcomes to measure denial recovery rates.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Cycle Flow */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Complete Revenue Cycle</h2>
            <p className="mt-4 text-lg text-gray-600">
              Every step of the revenue cycle, automated and optimized
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-green-200 -translate-y-1/2" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 relative">
              {[
                { step: '1', title: 'Eligibility', icon: FileCheck },
                { step: '2', title: 'Charge', icon: Receipt },
                { step: '3', title: 'Scrub', icon: AlertCircle },
                { step: '4', title: 'Submit', icon: ArrowRight },
                { step: '5', title: 'Post', icon: CreditCard },
                { step: '6', title: 'Collect', icon: DollarSign },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center relative bg-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white mb-3 z-10">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Core Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                    <capability.icon className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{capability.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powerful Financial Analytics
              </h2>
              <p className="text-gray-600 mb-6">
                Get complete visibility into your practice finances with comprehensive dashboards and reports.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time revenue dashboards',
                  'Accounts receivable aging',
                  'Payer performance analysis',
                  'Provider productivity reports',
                  'Denial trending and analysis',
                  'Collection rate tracking',
                  'Month-over-month comparisons',
                  'Custom report builder',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-600">MTD Collections</span>
                    <span className="font-bold text-green-600">$127,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Outstanding AR</span>
                    <span className="font-bold text-gray-900">$245,200</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Days in AR</span>
                    <span className="font-bold text-gray-900">32 days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Clean Claim Rate</span>
                    <span className="font-bold text-green-600">98.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Clearinghouse & Payer Connections</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((integration) => (
              <span key={integration} className="px-6 py-3 bg-white rounded-full text-gray-700 font-medium shadow-sm">
                {integration}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Maximize Your Revenue?
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join practices collecting more with less effort.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/modules/ai">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View AI Module
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
