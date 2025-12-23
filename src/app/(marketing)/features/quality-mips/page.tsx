import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Target,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quality & MIPS Tracking - Healthcare Quality Reporting',
  description: 'Real-time MIPS dashboard, care gap management, quality measure tracking, and CMS-ready reporting. Maximize your MIPS bonus and avoid penalties.',
  openGraph: {
    title: 'Quality & MIPS Tracking - PracticeFlux',
    description: 'Track all four MIPS categories, close care gaps, and generate CMS-ready quality reports.',
  },
}

const benefits = [
  {
    title: 'Real-Time MIPS Dashboard',
    description: 'See your projected MIPS score at any time with live tracking of all four performance categories.',
    icon: BarChart3,
  },
  {
    title: 'Care Gap Alerts',
    description: 'Identify patients with quality measure gaps before they fall out of compliance.',
    icon: AlertCircle,
  },
  {
    title: 'One-Click Reporting',
    description: 'Generate CMS-ready QRDA reports with a single click for easy submission.',
    icon: FileCheck,
  },
  {
    title: 'Performance Benchmarking',
    description: 'Compare your performance against national averages and identify improvement opportunities.',
    icon: TrendingUp,
  },
]

const features = [
  'Real-time MIPS composite score tracking',
  'Quality measure performance dashboards',
  'Promoting Interoperability tracking',
  'Improvement Activity documentation',
  'Cost category monitoring',
  'Patient-level quality gap analysis',
  'Provider-level performance comparison',
  'Measure selection optimization',
  'QRDA I report generation',
  'QRDA III report generation',
  'Automated CMS submission',
  'Historical performance trending',
  'National benchmark comparison',
  'What-if score analysis',
  'Care gap outreach tools',
  'Quality improvement workflows',
  'Exception and exclusion management',
  'Audit-ready documentation',
]

const mipsCategories = [
  { name: 'Quality', weight: '30%', description: 'Clinical quality measures performance' },
  { name: 'Promoting Interoperability', weight: '25%', description: 'EHR meaningful use and data exchange' },
  { name: 'Improvement Activities', weight: '15%', description: 'Practice improvement initiatives' },
  { name: 'Cost', weight: '30%', description: 'Medicare spending efficiency' },
]

const stats = [
  { value: '92+', label: 'Avg. MIPS Score' },
  { value: '15%', label: 'Bonus Achieved' },
  { value: '100%', label: 'Measure Compliance' },
  { value: '0', label: 'Penalties Avoided' },
]

export default function QualityMIPSPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Quality & MIPS Tracking</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Real-time quality measure tracking to maximize your MIPS scores and avoid penalties. Stay ahead of quality reporting requirements with automated gap identification.
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
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is MIPS */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is MIPS?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>MIPS (Merit-based Incentive Payment System)</strong> is the Centers for Medicare & Medicaid Services (CMS) quality payment program that adjusts Medicare reimbursement based on clinician performance. Under MIPS, providers can earn bonuses of up to 9% or face penalties of up to -9% on their Medicare payments.
              </p>
              <p>
                MIPS evaluates clinician performance across four categories:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Quality (30% of score):</strong> Performance on clinical quality measures relevant to your specialty, such as diabetes control, blood pressure management, and cancer screening rates.</li>
                <li><strong>Promoting Interoperability (25% of score):</strong> Meaningful use of certified EHR technology including e-prescribing, health information exchange, and patient portal engagement.</li>
                <li><strong>Improvement Activities (15% of score):</strong> Participation in clinical practice improvement activities such as care coordination, patient safety initiatives, and population health management.</li>
                <li><strong>Cost (30% of score):</strong> Medicare spending efficiency calculated from claims data, including total per capita cost and episode-based measures.</li>
              </ul>
              <p>
                Your final MIPS score (0-100 points) determines your payment adjustment for the following year. Scores above the performance threshold earn bonuses; scores below earn penalties.
              </p>
              <p>
                PracticeFlux tracks your performance in real-time across all four categories, identifies gaps, and helps you maximize your MIPS score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MIPS Categories */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Track All MIPS Categories</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tracking across all four MIPS performance categories
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mipsCategories.map((category) => (
              <div key={category.name} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{category.weight}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Stay Ahead of Quality Requirements
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  PracticeFlux Quality & MIPS Tracking gives you real-time visibility into your quality performance. See your projected MIPS score at any time and identify opportunities to improve before it&apos;s too late.
                </p>
                <p>
                  Our care gap alerts notify you when patients are missing quality measures, allowing proactive outreach to close gaps. Patient-level analysis shows exactly which measures each patient needs.
                </p>
                <p>
                  When it&apos;s time to report, generate CMS-ready QRDA reports with a single click. Our automated submission tools ensure your data reaches CMS accurately and on time.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">MIPS Performance Dashboard</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Projected MIPS Score</span>
                  <span className="text-2xl font-bold text-blue-600">92.4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-blue-600 h-4 rounded-full" style={{ width: '92.4%' }}></div>
                </div>
                <p className="text-sm text-green-600 mt-2">On track for maximum bonus</p>
              </div>
              <div className="space-y-3">
                {[
                  { category: 'Quality', score: 95, max: 100 },
                  { category: 'PI', score: 90, max: 100 },
                  { category: 'IA', score: 100, max: 100 },
                  { category: 'Cost', score: 85, max: 100 },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.category}</span>
                      <span className="font-medium">{item.score}/{item.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${(item.score/item.max)*100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Key Benefits</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to maximize MIPS performance
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-gray-50 rounded-xl p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">All Quality Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Complete tools for quality measure management
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Maximize Your MIPS Score?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join practices achieving 90+ MIPS scores with PracticeFlux quality tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
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
