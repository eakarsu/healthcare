import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mic,
  Pill,
  TestTube,
  ClipboardList,
  Shield,
  Zap,
} from 'lucide-react'

const benefits = [
  {
    title: 'Voice-Enabled Documentation',
    description: 'Dictate notes naturally and let AI transcribe and structure your documentation automatically.',
    icon: Mic,
  },
  {
    title: 'E-Prescribing with EPCS',
    description: 'Send prescriptions electronically to any pharmacy, including controlled substances with EPCS.',
    icon: Pill,
  },
  {
    title: 'Integrated Lab Orders',
    description: 'Order labs from LabCorp, Quest, and local labs with automatic results integration.',
    icon: TestTube,
  },
  {
    title: 'Customizable Templates',
    description: 'Create specialty-specific templates that match your workflow and documentation style.',
    icon: ClipboardList,
  },
]

const features = [
  'SOAP note templates with smart auto-population',
  'Voice-to-text documentation with medical vocabulary',
  'Problem list with ICD-10 integration',
  'Medication list with drug interaction alerts',
  'Allergy management with severity tracking',
  'E-prescribing to any pharmacy nationwide',
  'EPCS for controlled substance prescriptions',
  'Lab ordering with bidirectional results',
  'Imaging orders with PACS integration',
  'Growth charts and vitals tracking',
  'Immunization records and registry reporting',
  'Care plan documentation',
  'Patient education handouts',
  'After-visit summary generation',
  'Referral management with fax and Direct',
  'Document scanning and attachment',
]

const stats = [
  { value: '3x', label: 'Faster Documentation' },
  { value: '50%', label: 'Less Clicking' },
  { value: '100%', label: 'Paperless Workflow' },
  { value: '15min', label: 'Saved Per Patient' },
]

export default function ClinicalWorkflowsPage() {
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
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-100">
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Clinical Workflows</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Streamlined SOAP notes, e-prescriptions, and lab orders in one unified interface. Document faster and focus on what matters most - patient care.
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
      <section className="py-16 bg-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-teal-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Clinical Workflows */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What are Clinical Workflows?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Clinical Workflows</strong> refer to the sequence of processes and tasks that healthcare providers follow during patient care, from the moment a patient arrives until their visit is complete. Efficient clinical workflows are essential for delivering quality care while minimizing documentation burden.
              </p>
              <p>
                Modern clinical workflows in an EHR system encompass:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Patient intake:</strong> Capturing demographics, insurance, medical history, and reason for visit before the provider enters the room.</li>
                <li><strong>Clinical documentation:</strong> Recording the patient encounter using structured SOAP notes, templates, voice dictation, or AI-assisted documentation.</li>
                <li><strong>Order management:</strong> Prescribing medications electronically (e-prescribing), ordering laboratory tests, and requesting diagnostic imaging.</li>
                <li><strong>Clinical decision support:</strong> Real-time alerts for drug interactions, care gaps, and evidence-based recommendations during the encounter.</li>
                <li><strong>Care coordination:</strong> Managing referrals, communicating with specialists, and ensuring continuity of care across providers.</li>
                <li><strong>Patient education:</strong> Providing after-visit summaries, condition-specific handouts, and treatment instructions.</li>
                <li><strong>Follow-up management:</strong> Scheduling return visits, monitoring pending results, and tracking care plan progress.</li>
              </ul>
              <p>
                PracticeFlux optimizes every step of the clinical workflow to help you see more patients, document faster, and spend more time on direct patient care.
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
                Documentation That Works The Way You Think
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Flexible Documentation Methods:</strong> Whether you prefer typing, clicking through structured templates, or dictating naturally, PracticeFlux adapts to your style. Our medical-grade voice recognition understands clinical terminology and formats your notes properly.
                </p>
                <p>
                  <strong>Smart Templates:</strong> Specialty-specific templates auto-populate with relevant patient information, previous findings, and common phrases. Create your own templates and smart phrases to match your exact workflow.
                </p>
                <p>
                  <strong>Integrated Ordering:</strong> E-prescribe to any pharmacy nationwide with automatic drug interaction checking. Order labs with bidirectional results integration. Request imaging studies with PACS connectivity.
                </p>
                <p>
                  <strong>Seamless Coordination:</strong> Generate referrals with automatic faxing or Direct messaging. Share records securely with other providers. Track referral status and ensure patients complete recommended specialist visits.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">SOAP Note</h3>
                  <span className="text-xs text-gray-500">Auto-saving...</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Subjective</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      Patient presents with 3-day history of productive cough and low-grade fever...
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Objective</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      VS: T 100.2, HR 88, BP 128/82. Lungs: scattered rhonchi bilateral...
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Assessment</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      Acute bronchitis (J20.9)
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded">E-Prescribe</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded">Order Labs</button>
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
              Tools designed to reduce documentation burden
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">All Clinical Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Complete tools for clinical documentation and orders
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Integrated With Your Ecosystem</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Surescripts', 'LabCorp', 'Quest Diagnostics', 'Local Labs', 'Immunization Registries', 'Health Information Exchanges', 'PACS Systems', 'Direct Messaging'].map((integration) => (
              <span key={integration} className="px-6 py-3 bg-white rounded-full text-gray-700 font-medium shadow-sm">
                {integration}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Streamline Your Clinical Workflow?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Document faster, prescribe easier, and focus on patient care.
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
