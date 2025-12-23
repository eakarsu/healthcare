import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileCheck,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Receipt,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Revenue Cycle Management - Medical Billing Software',
  description: 'Complete RCM solution: eligibility verification, charge capture, claim scrubbing, electronic submission, ERA posting, denial management. Achieve 98%+ clean claim rates.',
  openGraph: {
    title: 'Revenue Cycle Management - PracticeFlux',
    description: 'End-to-end medical billing automation from eligibility to collections. Maximize reimbursements and reduce denials.',
  },
}

const benefits = [
  {
    title: 'Real-Time Eligibility',
    description: 'Verify insurance eligibility and benefits instantly before every visit to prevent claim denials.',
    icon: FileCheck,
  },
  {
    title: 'Automated Claim Scrubbing',
    description: 'AI-powered claim review catches errors before submission, reducing denials by up to 50%.',
    icon: AlertCircle,
  },
  {
    title: 'Faster Payments',
    description: 'Electronic claims submission and ERA auto-posting accelerate your revenue cycle.',
    icon: TrendingUp,
  },
  {
    title: 'Patient Payment Portal',
    description: 'Let patients pay online 24/7 with credit card, debit, or ACH payment options.',
    icon: CreditCard,
  },
]

const features = [
  'Real-time insurance eligibility verification',
  'Benefits and copay lookup',
  'Automated charge capture from clinical notes',
  'CPT and ICD-10 code validation',
  'AI-powered claim scrubbing',
  'Electronic claims submission (837P)',
  'ERA/EOB auto-posting (835)',
  'Denial management workflow',
  'Appeal letter generation',
  'Patient statement generation',
  'Online patient payments',
  'Payment plan management',
  'Credit card and ACH processing',
  'Accounts receivable aging reports',
  'Collection workflow automation',
  'Financial dashboards and analytics',
  'Payer contract management',
  'Fee schedule optimization',
]

const stats = [
  { value: '50%', label: 'Fewer Denials' },
  { value: '15 Days', label: 'Faster Payment' },
  { value: '98%', label: 'Clean Claim Rate' },
  { value: '$50K+', label: 'Avg. Annual Savings' },
]

export default function RevenueCyclePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
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
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Revenue Cycle Management</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Automated billing, claims submission, and payment tracking for faster reimbursements. Maximize your revenue with our complete RCM solution.
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

      {/* What is Revenue Cycle Management */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Revenue Cycle Management?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Revenue Cycle Management (RCM)</strong> encompasses all the administrative and clinical functions that contribute to the capture, management, and collection of patient service revenue. It begins when a patient schedules an appointment and ends when the final payment is collected.
              </p>
              <p>
                Effective RCM is critical for healthcare practice financial health:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Patient registration and eligibility:</strong> Verifying insurance coverage and benefits before services are rendered to prevent claim denials.</li>
                <li><strong>Charge capture:</strong> Accurately recording all services provided with proper CPT and ICD-10 codes to ensure complete billing.</li>
                <li><strong>Claims submission:</strong> Submitting clean, accurate claims to payers electronically to accelerate reimbursement.</li>
                <li><strong>Payment posting:</strong> Applying payments from insurance and patients to the correct accounts and services.</li>
                <li><strong>Denial management:</strong> Identifying, appealing, and resolving denied claims to recover lost revenue.</li>
                <li><strong>Patient collections:</strong> Collecting patient responsibility amounts including copays, deductibles, and coinsurance.</li>
                <li><strong>Financial reporting:</strong> Tracking key performance indicators like days in AR, denial rates, and collection rates.</li>
              </ul>
              <p>
                PracticeFlux automates and optimizes every stage of the revenue cycle to maximize reimbursement and minimize administrative burden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                End-to-End Revenue Cycle Automation
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Real-Time Eligibility Verification:</strong> Check insurance eligibility and benefits instantly at scheduling and again at check-in. See copay amounts, deductibles remaining, and authorization requirements before the visit to prevent billing surprises.
                </p>
                <p>
                  <strong>AI-Powered Claim Scrubbing:</strong> Our intelligent claim scrubbing engine reviews every claim before submission, checking for coding errors, missing information, bundling issues, and medical necessity. Catch problems before they become denials.
                </p>
                <p>
                  <strong>Electronic Remittance Auto-Posting:</strong> ERA files from payers are automatically processed and payments posted to the correct patient accounts. Contractual adjustments are applied automatically based on your payer contracts.
                </p>
                <p>
                  <strong>Denial Management Workflow:</strong> Denials are automatically categorized by reason and assigned to work queues. AI suggests appeal strategies based on denial patterns, and appeal letters can be generated with one click.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Dashboard</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Claims Submitted Today</span>
                    <span className="font-bold text-gray-900">47</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Pending Claims</span>
                    <span className="font-bold text-gray-900">$127,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-600">Payments This Week</span>
                    <span className="font-bold text-green-600">+$45,230</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-gray-600">Denials to Work</span>
                    <span className="font-bold text-red-600">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Key Benefits</h2>
            <p className="mt-4 text-lg text-gray-600">
              Maximize revenue with intelligent billing automation
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Cycle Flow */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">The Revenue Cycle Flow</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { step: 1, label: 'Eligibility Check', icon: FileCheck },
              { step: 2, label: 'Service Delivery', icon: Receipt },
              { step: 3, label: 'Charge Capture', icon: DollarSign },
              { step: 4, label: 'Claim Scrubbing', icon: AlertCircle },
              { step: 5, label: 'Claim Submission', icon: ArrowRight },
              { step: 6, label: 'Payment Posting', icon: CreditCard },
              { step: 7, label: 'Denial Management', icon: RefreshCw },
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 mb-2">
                    <item.icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                {idx < 6 && <ArrowRight className="h-6 w-6 text-gray-300 mx-4 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">All RCM Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Complete tools to optimize your revenue cycle
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Maximize Your Revenue?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Join practices that have reduced denials by 50% and accelerated payments by 15 days.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
