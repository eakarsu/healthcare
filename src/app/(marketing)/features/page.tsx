import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  FileText,
  DollarSign,
  Brain,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  Pill,
  FlaskConical,
  Scan,
  CreditCard,
  FileCheck,
  TrendingUp,
  MessageSquare,
  Bell,
  Smartphone,
  Shield,
  Lock,
  Server,
  RefreshCw,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features - Complete EHR, Billing & Practice Management',
  description: 'Explore PracticeFlux features: SOAP notes, e-prescribing, lab orders, revenue cycle management, AI clinical assistant, MIPS tracking, and more.',
  openGraph: {
    title: 'PracticeFlux Features - Complete Healthcare Practice Management',
    description: 'Explore all features: clinical documentation, billing, AI assistant, quality reporting, and seamless integrations.',
  },
}

const clinicalFeatures = [
  {
    name: 'Smart Scheduling',
    description: 'Drag-and-drop calendar with AI-powered optimization. Reduce no-shows with automated reminders and waitlist management.',
    icon: Calendar,
    href: '/features/smart-scheduling',
  },
  {
    name: 'SOAP Notes',
    description: 'Structured clinical documentation with customizable templates, voice-to-text, and AI-assisted note generation.',
    icon: FileText,
    href: '/features/soap-notes',
  },
  {
    name: 'E-Prescriptions',
    description: 'EPCS-certified electronic prescribing with drug interaction alerts, formulary checks, and pharmacy network integration.',
    icon: Pill,
    href: '/features/e-prescriptions',
  },
  {
    name: 'Lab Orders',
    description: 'Direct lab ordering with bidirectional results integration. View results in the patient chart automatically.',
    icon: FlaskConical,
    href: '/features/lab-orders',
  },
  {
    name: 'Imaging Orders',
    description: 'Order X-rays, CT, MRI, and ultrasounds with PACS integration for seamless image viewing.',
    icon: Scan,
    href: '/features/imaging-orders',
  },
  {
    name: 'Patient Portal',
    description: 'Secure patient access to records, appointment scheduling, prescription refills, and secure messaging.',
    icon: Users,
    href: '/features/patient-engagement',
  },
]

const billingFeatures = [
  {
    name: 'Charge Capture',
    description: 'Automatic charge capture from encounters with CPT and ICD-10 code suggestions based on documentation.',
    icon: DollarSign,
    href: '/features/revenue-cycle',
  },
  {
    name: 'Claims Management',
    description: 'Electronic claims submission to all major payers with real-time eligibility verification and claim status tracking.',
    icon: FileCheck,
    href: '/features/revenue-cycle',
  },
  {
    name: 'Payment Processing',
    description: 'Accept credit cards, ACH, and patient payment plans. Automatic payment posting and reconciliation.',
    icon: CreditCard,
    href: '/features/revenue-cycle',
  },
  {
    name: 'Denial Management',
    description: 'Track denials, automate appeals, and identify patterns to prevent future denials.',
    icon: RefreshCw,
    href: '/features/revenue-cycle',
  },
  {
    name: 'Financial Reporting',
    description: 'Real-time dashboards for A/R aging, collections, payer mix, and revenue trends.',
    icon: TrendingUp,
    href: '/features/revenue-cycle',
  },
  {
    name: 'Superbill Generation',
    description: 'Generate accurate superbills from encounter documentation with proper modifier application.',
    icon: FileText,
    href: '/features/revenue-cycle',
  },
]

const aiFeatures = [
  {
    name: 'Clinical Decision Support',
    description: 'AI-powered diagnostic suggestions based on symptoms, labs, and patient history. Evidence-based treatment recommendations.',
    icon: Brain,
    href: '/features/ai-assistant',
  },
  {
    name: 'Documentation Assistant',
    description: 'Generate SOAP notes from voice recordings or bullet points. AI summarizes patient history and suggests relevant details.',
    icon: FileText,
    href: '/features/ai-assistant',
  },
  {
    name: 'Coding Optimization',
    description: 'AI reviews documentation and suggests optimal CPT/ICD-10 codes to maximize compliant reimbursement.',
    icon: DollarSign,
    href: '/features/ai-assistant',
  },
  {
    name: 'Risk Stratification',
    description: 'Identify high-risk patients who may benefit from proactive interventions using predictive analytics.',
    icon: BarChart3,
    href: '/features/ai-assistant',
  },
]

const qualityFeatures = [
  {
    name: 'MIPS Dashboard',
    description: 'Real-time tracking of all MIPS categories: Quality, Promoting Interoperability, Improvement Activities, and Cost.',
    icon: BarChart3,
    href: '/features/quality-mips',
  },
  {
    name: 'Care Gap Alerts',
    description: 'Identify patients missing screenings, vaccinations, or follow-up care. Close gaps during visits.',
    icon: Bell,
    href: '/features/quality-mips',
  },
  {
    name: 'Quality Reporting',
    description: 'Automated measure calculation and CMS-ready reports. Track performance against national benchmarks.',
    icon: FileCheck,
    href: '/features/quality-mips',
  },
  {
    name: 'Patient Outreach',
    description: 'Automated campaigns to reach patients due for preventive care, chronic disease management, or annual wellness visits.',
    icon: MessageSquare,
    href: '/features/quality-mips',
  },
]

const integrations = [
  'Epic', 'Cerner', 'Allscripts', 'athenahealth', 'Surescripts', 'Quest Diagnostics',
  'LabCorp', 'Change Healthcare', 'Availity', 'Stripe', 'Square', 'Twilio'
]

const securityFeatures = [
  {
    name: 'HIPAA Compliance',
    description: 'Full compliance with HIPAA Privacy and Security Rules. Business Associate Agreements available.',
    icon: Shield,
  },
  {
    name: 'Data Encryption',
    description: '256-bit AES encryption at rest and TLS 1.3 in transit. Zero-knowledge architecture for sensitive data.',
    icon: Lock,
  },
  {
    name: 'SOC 2 Type II',
    description: 'Independently audited security controls covering security, availability, and confidentiality.',
    icon: FileCheck,
  },
  {
    name: '99.9% Uptime SLA',
    description: 'Multi-region redundancy with automatic failover. Continuous monitoring and incident response.',
    icon: Server,
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Powerful Features for Modern Practices
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to run an efficient, profitable healthcare practice. From clinical workflows to revenue cycle management, PracticeFlux has you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <span className="inline-flex items-center rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700">
              Clinical Module
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete EHR Functionality
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline clinical documentation, manage orders, and improve care coordination with our comprehensive clinical tools.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {clinicalFeatures.map((feature) => (
                <div key={feature.name} className="relative bg-gray-50 rounded-xl p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <feature.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  <Link href={feature.href} className="mt-3 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Billing Module */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
              Billing Module
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Revenue Cycle Management
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Maximize reimbursements and reduce claim denials with our end-to-end billing solution.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {billingFeatures.map((feature) => (
                <div key={feature.name} className="relative bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  <Link href={feature.href} className="mt-3 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-700">
              AI Assistant
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              AI-Powered Clinical Intelligence
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Leverage artificial intelligence to improve diagnostic accuracy, reduce documentation burden, and optimize coding.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {aiFeatures.map((feature) => (
                <div key={feature.name} className="relative bg-purple-50 rounded-xl p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <feature.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  <Link href={feature.href} className="mt-3 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality Module */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
              Quality Module
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Quality & MIPS Tracking
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stay on top of quality measures, close care gaps, and maximize your MIPS reimbursement.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {qualityFeatures.map((feature) => (
                <div key={feature.name} className="relative bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  <Link href={feature.href} className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Seamless Integrations
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect with the tools and systems you already use. PracticeFlux integrates with leading healthcare technology platforms.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="flex flex-wrap justify-center gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration}
                  className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  {integration}
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t see your system? <Link href="/contact" className="text-teal-600 hover:text-teal-700">Contact us</Link> about custom integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Enterprise-Grade Security
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Your patient data is protected by industry-leading security measures and compliance certifications.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {securityFeatures.map((feature) => (
                <div key={feature.name} className="relative bg-gray-800 rounded-xl p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20">
                    <feature.icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Access Anywhere, Anytime
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                PracticeFlux works on any device. Access your practice from the office, hospital, or home with our responsive web app and native mobile apps.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'View schedules and patient charts on the go',
                  'Receive real-time alerts and notifications',
                  'Complete documentation from any device',
                  'Secure offline access with automatic sync',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-4">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Smartphone className="mr-2 h-4 w-4" /> iOS App
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Smartphone className="mr-2 h-4 w-4" /> Android App
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8">
              <div className="aspect-[9/16] max-w-[280px] mx-auto bg-white rounded-3xl shadow-2xl p-4">
                <div className="bg-gray-100 rounded-2xl h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <Smartphone className="h-12 w-12 text-teal-600 mx-auto" />
                    <p className="mt-4 text-sm text-gray-600">PracticeFlux Mobile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to See It in Action?
            </h2>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              Schedule a personalized demo and see how PracticeFlux can transform your practice.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
