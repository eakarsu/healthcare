import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  HeartPulse,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Pill,
  TestTube,
  Mic,
  Shield,
  Users,
  Activity,
  Clipboard,
} from 'lucide-react'

const capabilities = [
  {
    title: 'SOAP Note Documentation',
    description: 'Customizable templates for every specialty with smart auto-population and voice dictation.',
    icon: FileText,
    features: [
      'Specialty-specific templates',
      'Voice-to-text documentation',
      'Smart phrase expansion',
      'Auto-population from history',
      'Template customization tools',
      'Structured data capture',
    ],
  },
  {
    title: 'E-Prescribing',
    description: 'Send prescriptions electronically to any pharmacy nationwide, including controlled substances.',
    icon: Pill,
    features: [
      'EPCS for controlled substances',
      'Real-time formulary checking',
      'Drug interaction alerts',
      'Pharmacy network lookup',
      'Prescription history',
      'Refill management',
    ],
  },
  {
    title: 'Lab & Imaging Orders',
    description: 'Order labs and imaging studies with automatic results integration and trending.',
    icon: TestTube,
    features: [
      'LabCorp integration',
      'Quest Diagnostics integration',
      'Local lab connectivity',
      'Imaging order management',
      'Results auto-import',
      'Result trending and graphing',
    ],
  },
  {
    title: 'Patient Records',
    description: 'Complete patient health records with problem lists, medications, allergies, and more.',
    icon: Clipboard,
    features: [
      'Problem list with ICD-10',
      'Medication management',
      'Allergy tracking with severity',
      'Immunization records',
      'Family history',
      'Social history',
    ],
  },
]

const integrations = [
  'Surescripts',
  'LabCorp',
  'Quest Diagnostics',
  'Local Reference Labs',
  'Immunization Registries',
  'Health Information Exchanges',
  'PACS Systems',
  'Direct Messaging',
]

const stats = [
  { value: '3x', label: 'Faster Documentation' },
  { value: '100%', label: 'E-Prescribing' },
  { value: '24hr', label: 'Lab Result Turnaround' },
  { value: '99.9%', label: 'Uptime' },
]

export default function ClinicalModulePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-red-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100">
              <HeartPulse className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Module</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Clinical Module</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Complete EHR functionality with SOAP notes, e-prescriptions, lab integration, and imaging orders. Built by clinicians, for clinicians.
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
      <section className="py-16 bg-red-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Clinical Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Clinical Module in Healthcare EHR?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                A <strong>Clinical Module</strong> is the core component of an Electronic Health Record (EHR) system that handles all patient-facing clinical functions. It is where healthcare providers document patient encounters, manage medical records, prescribe medications, order diagnostic tests, and coordinate patient care.
              </p>
              <p>
                The Clinical Module is essential because it serves as the central hub for all clinical activities in a medical practice:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Patient Health Records:</strong> Maintains comprehensive longitudinal health records including demographics, problem lists, medication lists, allergies, immunizations, family history, and social history.</li>
                <li><strong>Clinical Documentation:</strong> Provides structured SOAP (Subjective, Objective, Assessment, Plan) note templates for documenting patient encounters with support for voice dictation, smart phrases, and auto-population.</li>
                <li><strong>E-Prescribing:</strong> Enables electronic transmission of prescriptions to pharmacies nationwide, including EPCS (Electronic Prescribing for Controlled Substances) for Schedule II-V medications.</li>
                <li><strong>Order Management:</strong> Facilitates electronic ordering of laboratory tests, imaging studies, referrals, and procedures with bidirectional results integration.</li>
                <li><strong>Clinical Decision Support:</strong> Provides real-time alerts for drug interactions, allergies, contraindications, and evidence-based care recommendations.</li>
                <li><strong>Care Coordination:</strong> Enables secure communication with other providers, specialists, and facilities through Direct messaging and health information exchange.</li>
                <li><strong>Patient Communication:</strong> Connects to patient portals for secure messaging, appointment scheduling, and sharing of health information.</li>
              </ul>
              <p>
                PracticeFlux Clinical Module is designed by physicians for physicians, with an intuitive interface that reduces clicks, minimizes documentation time, and lets you focus on what matters most - patient care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed SOAP Notes Explanation */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Clinical Documentation Made Easy</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>SOAP Note Templates:</strong> Choose from 50+ specialty-specific templates or create your own. Templates auto-populate with relevant patient data including current medications, allergies, recent vitals, and active problems. Smart phrases let you type shortcuts that expand into full text blocks.
                </p>
                <p>
                  <strong>Voice-to-Text Dictation:</strong> Our medical-grade speech recognition understands clinical terminology, medication names, and anatomical terms. Dictate naturally while maintaining eye contact with your patient. Accuracy exceeds 99% for medical vocabulary.
                </p>
                <p>
                  <strong>AI-Assisted Documentation:</strong> As you document, AI analyzes your findings and suggests relevant diagnoses, ICD-10 codes, and treatment options. The system learns your preferences over time to make increasingly accurate suggestions.
                </p>
                <p>
                  <strong>Auto-Population:</strong> Patient demographics, current medications, allergies, immunization status, and recent vitals are automatically pulled into your note. Previous visit information is readily available for reference and carry-forward.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs font-semibold text-red-600 mb-1">SUBJECTIVE</p>
                  <p className="text-sm text-gray-700">Patient presents with 3-day history of productive cough and low-grade fever. Denies chest pain, shortness of breath...</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-1">OBJECTIVE</p>
                  <p className="text-sm text-gray-700">Temp: 99.8°F, BP: 128/82, HR: 88, RR: 18. Lungs: scattered rhonchi bilateral, no wheezes...</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-semibold text-green-600 mb-1">ASSESSMENT</p>
                  <p className="text-sm text-gray-700">1. Acute bronchitis (J20.9)</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-semibold text-purple-600 mb-1">PLAN</p>
                  <p className="text-sm text-gray-700">1. Supportive care 2. Dextromethorphan PRN 3. Return if worsening...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-Prescribing Explanation */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Electronic Prescribing (E-Prescribing)</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                E-Prescribing allows you to send prescriptions electronically directly to the patient's pharmacy of choice. PracticeFlux connects to over 70,000 pharmacies nationwide through the Surescripts network.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>EPCS Certified:</strong> Our DEA-certified EPCS module allows electronic prescribing of Schedule II-V controlled substances with identity proofing and two-factor authentication.</li>
                <li><strong>Drug Interaction Checking:</strong> Real-time alerts for drug-drug interactions, drug-allergy conflicts, duplicate therapies, and contraindications based on patient conditions.</li>
                <li><strong>Formulary Integration:</strong> See real-time insurance formulary status, patient copay amounts, and tier information. Get suggestions for therapeutically equivalent alternatives when needed.</li>
                <li><strong>Prescription History:</strong> View complete prescription history from all providers through the Surescripts network to prevent duplicate prescriptions and identify potential abuse.</li>
                <li><strong>Refill Management:</strong> Manage refill requests electronically with one-click approval or denial. Send messages to patients about refill status.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lab & Imaging Explanation */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Laboratory and Imaging Integration</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                PracticeFlux provides seamless integration with major laboratory networks and imaging centers, enabling electronic ordering and automatic results retrieval.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Lab Orders:</strong> Order tests electronically from LabCorp, Quest Diagnostics, and local reference laboratories. Results are automatically imported and matched to the correct patient record.</li>
                <li><strong>Result Trending:</strong> View lab results in table format or graph values over time to track treatment effectiveness. Compare current values to previous results and reference ranges.</li>
                <li><strong>Critical Value Alerts:</strong> Immediate notification when panic values or critical results are received, enabling rapid clinical response.</li>
                <li><strong>Imaging Orders:</strong> Order X-rays, CT scans, MRIs, ultrasounds, and other imaging studies electronically. PACS integration allows viewing of diagnostic-quality images directly in PracticeFlux.</li>
                <li><strong>Radiology Reports:</strong> Radiologist interpretations are automatically imported and linked to the original order. Critical findings trigger immediate alerts.</li>
              </ul>
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
                    <capability.icon className="h-7 w-7 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{capability.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Additional Clinical Features</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              'Growth charts and BMI calculations',
              'Vitals tracking with trending',
              'Care plan documentation',
              'Patient education handouts',
              'After-visit summary generation',
              'Referral letter generation',
              'Document scanning and attachment',
              'Image annotation tools',
              'Clinical alerts and reminders',
              'Order set templates',
              'Procedure documentation',
              'Consent form management',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
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
            <h2 className="text-3xl font-bold text-gray-900">Seamless Integrations</h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect with the services your practice already uses
            </p>
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
      <section className="py-24 bg-gradient-to-r from-red-600 to-rose-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Clinical Workflow?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join thousands of clinicians documenting faster and delivering better care.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/modules/billing">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View Billing Module
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
