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
  Award,
  PieChart,
} from 'lucide-react'

const capabilities = [
  {
    title: 'Quality Measure Tracking',
    description: 'Real-time tracking of all applicable quality measures with patient-level detail.',
    icon: Target,
    features: [
      'MIPS quality measures',
      'ACO quality measures',
      'Commercial payer measures',
      'Real-time performance calculation',
      'Patient-level gap lists',
      'Measure selection optimization',
    ],
  },
  {
    title: 'Care Gap Management',
    description: 'Identify and close care gaps before patients fall out of compliance.',
    icon: AlertCircle,
    features: [
      'Automated gap identification',
      'Patient outreach tools',
      'Pre-visit gap alerts',
      'Bulk outreach campaigns',
      'Gap closure tracking',
      'Exception documentation',
    ],
  },
  {
    title: 'MIPS Reporting',
    description: 'Comprehensive MIPS program support from measure selection to CMS submission.',
    icon: FileCheck,
    features: [
      'All four MIPS categories',
      'Measure performance forecasting',
      'QRDA I and III generation',
      'Automated CMS submission',
      'What-if score analysis',
      'Historical trending',
    ],
  },
  {
    title: 'Performance Analytics',
    description: 'Comprehensive dashboards and reports to drive quality improvement.',
    icon: TrendingUp,
    features: [
      'Real-time dashboards',
      'Provider comparisons',
      'National benchmarking',
      'Trend analysis',
      'Custom report builder',
      'Executive summaries',
    ],
  },
]

const mipsCategories = [
  { name: 'Quality', weight: '30%', color: 'bg-blue-500' },
  { name: 'Promoting Interoperability', weight: '25%', color: 'bg-green-500' },
  { name: 'Improvement Activities', weight: '15%', color: 'bg-yellow-500' },
  { name: 'Cost', weight: '30%', color: 'bg-purple-500' },
]

const stats = [
  { value: '92+', label: 'Average MIPS Score' },
  { value: '15%', label: 'Bonus Achieved' },
  { value: '100%', label: 'Measure Compliance' },
  { value: '$0', label: 'Penalties' },
]

export default function QualityModulePage() {
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
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Module</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Quality Module</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Track MIPS measures, identify care gaps, and generate CMS-ready reports. Maximize your quality bonuses and avoid penalties with real-time performance tracking.
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

      {/* What is Quality Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Quality Module in Healthcare EHR?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                A <strong>Quality Module</strong> is the component of an EHR system that tracks clinical quality measures, manages care gaps, and handles quality reporting requirements. It helps healthcare practices demonstrate quality care delivery and comply with programs like MIPS, ACOs, and commercial payer quality incentives.
              </p>
              <p>
                The Quality Module is essential for modern healthcare practices because it addresses:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Quality Measure Tracking:</strong> Monitors performance on clinical quality measures such as diabetes control, blood pressure management, cancer screenings, immunizations, and preventive care.</li>
                <li><strong>MIPS Compliance:</strong> Tracks all four MIPS performance categories (Quality, Promoting Interoperability, Improvement Activities, and Cost) to maximize bonuses and avoid penalties.</li>
                <li><strong>Care Gap Identification:</strong> Identifies patients who are missing recommended screenings, vaccinations, or chronic disease monitoring so practices can proactively close gaps.</li>
                <li><strong>Patient Outreach:</strong> Automates patient communication for care gap closure including appointment reminders, screening notifications, and wellness visit invitations.</li>
                <li><strong>Performance Benchmarking:</strong> Compares practice performance against national averages, specialty benchmarks, and historical trends to identify improvement opportunities.</li>
                <li><strong>Quality Reporting:</strong> Generates CMS-ready QRDA I and QRDA III reports for electronic submission to meet reporting requirements.</li>
                <li><strong>Population Health:</strong> Provides population-level views of patient panels to manage chronic diseases, risk stratification, and preventive care at scale.</li>
              </ul>
              <p>
                PracticeFlux Quality Module helps practices achieve MIPS scores of 90+ points, qualify for maximum bonuses, and avoid penalties through proactive quality management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MIPS Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding MIPS (Merit-based Incentive Payment System)</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                MIPS is the CMS quality payment program that adjusts Medicare Part B reimbursement based on clinician performance. Your MIPS score (0-100 points) determines whether you receive a bonus, penalty, or neutral adjustment.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Quality (30% of score):</strong> Performance on 6 clinical quality measures relevant to your specialty. Choose from hundreds of measures or use our recommendation engine to select optimal measures.</li>
                <li><strong>Promoting Interoperability (25% of score):</strong> Meaningful use of EHR technology including e-prescribing, health information exchange, security practices, and patient access.</li>
                <li><strong>Improvement Activities (15% of score):</strong> Participation in practice improvement activities like care coordination, beneficiary engagement, patient safety, and population management.</li>
                <li><strong>Cost (30% of score):</strong> Medicare spending efficiency calculated automatically from claims data. No action required but understanding your cost performance helps identify opportunities.</li>
              </ul>
              <p>
                Scores above the performance threshold earn bonuses up to 9%. Scores below earn penalties up to -9%. PracticeFlux tracks your projected score in real-time so you can take action before it's too late.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Gaps Explained */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Care Gap Management</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Care gaps represent missed opportunities for preventive care, screenings, and chronic disease management. Closing care gaps improves both patient outcomes and quality scores.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Gap Identification:</strong> Automatically identify patients who are due for preventive services like mammograms, colonoscopies, A1C tests, or annual wellness visits.</li>
                <li><strong>Pre-Visit Planning:</strong> See all open care gaps for a patient before their visit so you can address them during the encounter.</li>
                <li><strong>Point-of-Care Alerts:</strong> Real-time notifications during patient encounters remind providers of applicable quality measures and care gaps.</li>
                <li><strong>Patient Outreach:</strong> Automated campaigns reach patients due for care via patient portal, text message, email, or phone call.</li>
                <li><strong>Gap Closure Documentation:</strong> Easy documentation of gap closure, exclusions, and exceptions with proper coding for quality measure credit.</li>
                <li><strong>Tracking and Reporting:</strong> Monitor gap closure rates over time by measure, provider, and patient population.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Reporting Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quality Reporting and Submission</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                PracticeFlux handles the complexity of quality reporting with automated measure calculation and CMS-ready report generation.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Measure Selection:</strong> Our recommendation engine analyzes your patient population and suggests the optimal measure set for maximum points.</li>
                <li><strong>Real-Time Calculation:</strong> Quality measure performance is calculated continuously so you always know where you stand.</li>
                <li><strong>QRDA I Generation:</strong> Patient-level quality reports in QRDA Category I format for registry submission.</li>
                <li><strong>QRDA III Generation:</strong> Aggregate quality reports in QRDA Category III format for direct CMS submission.</li>
                <li><strong>Submission Support:</strong> Submit reports directly to CMS or qualified registries with validation to ensure successful acceptance.</li>
                <li><strong>Audit Support:</strong> Complete audit trail and supporting documentation in case of CMS review.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MIPS Dashboard Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Real-Time MIPS Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Monitor your MIPS performance across all four categories with our comprehensive dashboard. See your projected final score at any time and identify areas needing attention.
              </p>
              <p className="text-gray-600 mb-6">
                PracticeFlux tracks your performance in real-time, calculates weighted scores, and forecasts your payment adjustment so you can take action before submission deadlines.
              </p>
              <div className="space-y-4">
                {mipsCategories.map((category) => (
                  <div key={category.name} className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${category.color}`} />
                    <span className="flex-1 text-gray-700">{category.name}</span>
                    <span className="font-semibold text-gray-900">{category.weight}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">2025 MIPS Performance</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    On Track
                  </span>
                </div>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-blue-600">92.4</div>
                  <div className="text-sm text-gray-500 mt-1">Projected Final Score</div>
                </div>
                <div className="space-y-3">
                  {[
                    { category: 'Quality', score: 45, max: 45, percent: 100 },
                    { category: 'Promoting Interoperability', score: 22, max: 25, percent: 88 },
                    { category: 'Improvement Activities', score: 15, max: 15, percent: 100 },
                    { category: 'Cost', score: 10.4, max: 15, percent: 69 },
                  ].map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium">{item.score}/{item.max} pts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                    <capability.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{capability.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Gap Workflow */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Close Care Gaps Efficiently</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Identify', description: 'System automatically identifies patients with open care gaps' },
              { step: '2', title: 'Prioritize', description: 'Gaps are ranked by impact and urgency' },
              { step: '3', title: 'Outreach', description: 'Automated patient communication via portal, text, or call' },
              { step: '4', title: 'Close', description: 'Document gap closure at point of care' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Additional Quality Features</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              'Population health dashboards',
              'Risk stratification tools',
              'Chronic care management tracking',
              'Preventive care reminders',
              'Registry submissions',
              'ACO quality reporting',
              'Commercial payer reporting',
              'Clinical quality measure library',
              'Performance improvement tools',
              'Audit trail and documentation',
              'Team performance comparisons',
              'Automated exception handling',
            ].map((feature, idx) => (
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
            Join practices achieving 90+ MIPS scores year after year.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/modules/clinical">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View Clinical Module
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
