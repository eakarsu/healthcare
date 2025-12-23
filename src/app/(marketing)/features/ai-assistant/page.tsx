import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mic,
  Code,
  Stethoscope,
  AlertTriangle,
  Search,
  Lightbulb,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Clinical Assistant - Medical AI & Documentation',
  description: 'AI-powered clinical tools: ambient AI scribe, diagnostic suggestions, automated medical coding, drug interaction checking, and natural language record search.',
  openGraph: {
    title: 'AI Clinical Assistant - PracticeFlux',
    description: 'Leverage AI for clinical documentation, diagnosis support, coding optimization, and patient safety alerts.',
  },
}

const benefits = [
  {
    title: 'Ambient AI Scribe',
    description: 'Our AI listens to patient encounters and automatically generates structured clinical notes, saving hours daily.',
    icon: Mic,
  },
  {
    title: 'Automated Coding',
    description: 'AI suggests accurate ICD-10 and CPT codes based on your documentation, improving coding accuracy and revenue.',
    icon: Code,
  },
  {
    title: 'Diagnostic Support',
    description: 'Get evidence-based diagnostic suggestions during encounters to support clinical decision-making.',
    icon: Stethoscope,
  },
  {
    title: 'Drug Interaction Alerts',
    description: 'Real-time alerts for drug-drug and drug-allergy interactions protect patient safety.',
    icon: AlertTriangle,
  },
]

const features = [
  'Ambient clinical intelligence - listens and documents',
  'Natural language processing for note generation',
  'SOAP note auto-generation from conversations',
  'ICD-10 code suggestions from documentation',
  'CPT code recommendations with level justification',
  'Drug-drug interaction checking',
  'Drug-allergy alerts',
  'Contraindication warnings',
  'Evidence-based diagnostic suggestions',
  'Clinical guideline integration',
  'Care gap identification at point of care',
  'Prior authorization requirement detection',
  'Predictive no-show analytics',
  'Hospitalization risk assessment',
  'Natural language search across records',
  'Voice-enabled commands and navigation',
]

const stats = [
  { value: '70%', label: 'Less Documentation Time' },
  { value: '95%', label: 'Coding Accuracy' },
  { value: '2hrs', label: 'Saved Per Provider Daily' },
  { value: '99%', label: 'Drug Alert Accuracy' },
]

export default function AIAssistantPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Clinical Assistant</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Harness the power of artificial intelligence to reduce documentation burden, improve clinical decision-making, and ensure accurate coding.
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
      <section className="py-16 bg-purple-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-purple-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is AI Clinical Assistant */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an AI Clinical Assistant?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                An <strong>AI Clinical Assistant</strong> is an artificial intelligence system designed to support healthcare providers during patient care. It uses advanced machine learning, natural language processing, and clinical knowledge bases to automate documentation, provide decision support, and enhance patient safety.
              </p>
              <p>
                AI Clinical Assistants address the documentation crisis in healthcare:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Ambient clinical intelligence:</strong> AI listens to natural patient-provider conversations and automatically generates structured clinical documentation, eliminating the need for manual note-taking.</li>
                <li><strong>Automated medical coding:</strong> AI analyzes documentation and suggests accurate ICD-10 diagnosis codes and CPT procedure codes, improving coding accuracy and maximizing appropriate reimbursement.</li>
                <li><strong>Clinical decision support:</strong> Real-time suggestions for diagnoses, tests, and treatments based on patient symptoms, history, and evidence-based guidelines.</li>
                <li><strong>Drug safety checking:</strong> Automatic detection of drug-drug interactions, drug-allergy conflicts, and contraindications before prescribing.</li>
                <li><strong>Care gap identification:</strong> AI identifies missing preventive care, overdue screenings, and quality measure gaps during the encounter.</li>
                <li><strong>Natural language queries:</strong> Ask questions about the patient record in plain English and get instant, relevant answers.</li>
              </ul>
              <p>
                PracticeFlux AI Clinical Assistant helps providers focus on patient care while AI handles the administrative burden.
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
                Your AI-Powered Clinical Partner
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Ambient AI Scribe:</strong> Our AI listens to the natural conversation between you and your patient, understanding context, medical terminology, and clinical nuances. It generates complete SOAP notes with proper formatting and medical vocabulary.
                </p>
                <p>
                  <strong>Intelligent Coding Suggestions:</strong> As you document, AI analyzes your findings and suggests appropriate ICD-10 and CPT codes. It explains the rationale for each suggestion and indicates the documentation elements supporting each code level.
                </p>
                <p>
                  <strong>Diagnostic Decision Support:</strong> Based on the symptoms and findings documented, AI suggests possible diagnoses ranked by likelihood. Each suggestion includes links to relevant clinical guidelines and evidence.
                </p>
                <p>
                  <strong>Medication Safety:</strong> When you prescribe, AI automatically checks for drug-drug interactions, drug-allergy conflicts, duplicate therapies, and contraindications based on the patient's conditions. Severity ratings help you make informed decisions.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-xs text-gray-500">Listening...</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      <strong>Suggested Diagnosis:</strong> Based on symptoms of productive cough, fever, and bilateral rhonchi, consider Acute Bronchitis (J20.9)
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Drug Alert:</strong> Azithromycin may interact with patient&apos;s current Warfarin. Consider dosage adjustment.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Coding Suggestion:</strong> E/M Level 99214 supported based on documentation complexity
                    </p>
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
              AI that enhances your clinical practice
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Ambient Scribe Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How Ambient AI Scribe Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Listen', description: 'AI listens to the natural conversation between you and your patient' },
              { step: '2', title: 'Understand', description: 'Natural language processing extracts clinical information' },
              { step: '3', title: 'Generate', description: 'Structured SOAP note is created with proper formatting' },
              { step: '4', title: 'Review', description: 'You review, edit if needed, and sign off on the note' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">All AI Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive AI capabilities for modern practice
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience AI-Powered Practice?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join providers saving 2+ hours daily with PracticeFlux AI Assistant.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
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
