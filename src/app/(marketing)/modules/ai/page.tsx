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
  Sparkles,
  MessageSquare,
} from 'lucide-react'

const capabilities = [
  {
    title: 'Ambient AI Scribe',
    description: 'Listens to patient encounters and automatically generates structured clinical documentation.',
    icon: Mic,
    features: [
      'Passive encounter listening',
      'Speaker diarization',
      'Medical terminology recognition',
      'SOAP note generation',
      'Template adaptation',
      'Multi-language support',
    ],
  },
  {
    title: 'Automated Medical Coding',
    description: 'AI suggests accurate ICD-10 and CPT codes based on your documentation.',
    icon: Code,
    features: [
      'ICD-10 code suggestions',
      'CPT code recommendations',
      'E/M level justification',
      'Modifier suggestions',
      'Coding compliance checks',
      'Documentation gap alerts',
    ],
  },
  {
    title: 'Clinical Decision Support',
    description: 'Evidence-based diagnostic suggestions and clinical guidelines at point of care.',
    icon: Stethoscope,
    features: [
      'Differential diagnosis suggestions',
      'Clinical guideline integration',
      'Evidence-based recommendations',
      'Risk score calculations',
      'Screening reminders',
      'Best practice alerts',
    ],
  },
  {
    title: 'Drug Safety',
    description: 'Real-time alerts for drug interactions, allergies, and contraindications.',
    icon: AlertTriangle,
    features: [
      'Drug-drug interactions',
      'Drug-allergy checking',
      'Contraindication alerts',
      'Dosage recommendations',
      'Pregnancy/lactation warnings',
      'Renal dose adjustments',
    ],
  },
]

const useCases = [
  {
    title: 'During the Visit',
    description: 'AI listens and suggests diagnoses, alerts to drug interactions, and recommends preventive care.',
    icon: Sparkles,
  },
  {
    title: 'Documentation',
    description: 'Generate complete SOAP notes from the encounter conversation with minimal editing.',
    icon: MessageSquare,
  },
  {
    title: 'Coding & Billing',
    description: 'Get accurate code suggestions to maximize reimbursement and reduce denials.',
    icon: Code,
  },
  {
    title: 'Care Planning',
    description: 'AI identifies care gaps and suggests next steps for chronic disease management.',
    icon: Lightbulb,
  },
]

const stats = [
  { value: '70%', label: 'Time Saved on Documentation' },
  { value: '95%', label: 'Coding Accuracy' },
  { value: '2hrs', label: 'Saved Daily Per Provider' },
  { value: '99%', label: 'Alert Accuracy' },
]

export default function AIModulePage() {
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
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Module</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Assistant Module</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Clinical decision support, automated coding suggestions, and documentation assistance. Harness the power of AI to practice medicine more efficiently.
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

      {/* What is AI Module */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an AI Module in Healthcare EHR?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                An <strong>AI Module</strong> (Artificial Intelligence Module) is a set of machine learning and natural language processing capabilities integrated into an EHR system to automate tasks, provide decision support, and enhance clinical workflows. It represents the application of modern AI technology specifically designed for healthcare settings.
              </p>
              <p>
                The AI Module transforms healthcare practice in several critical areas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Ambient Clinical Intelligence:</strong> AI listens to natural conversations between providers and patients, extracting clinical information and automatically generating structured documentation without manual data entry.</li>
                <li><strong>Medical Speech Recognition:</strong> Advanced natural language processing understands clinical terminology, medication names, anatomical terms, and medical abbreviations with over 99% accuracy.</li>
                <li><strong>Automated Medical Coding:</strong> AI analyzes clinical documentation and suggests accurate ICD-10 diagnosis codes and CPT procedure codes, improving coding accuracy and maximizing appropriate reimbursement.</li>
                <li><strong>Clinical Decision Support:</strong> Real-time suggestions for diagnoses, tests, and treatments based on patient symptoms, history, lab results, and evidence-based clinical guidelines.</li>
                <li><strong>Drug Safety Checking:</strong> Automatic detection of drug-drug interactions, drug-allergy conflicts, contraindications, dosage issues, and other medication safety concerns.</li>
                <li><strong>Care Gap Identification:</strong> AI identifies missing preventive care, overdue screenings, vaccination gaps, and quality measure opportunities at the point of care.</li>
                <li><strong>Predictive Analytics:</strong> Machine learning models predict patient risks such as no-shows, hospital readmissions, disease progression, and complications.</li>
                <li><strong>Natural Language Search:</strong> Query the entire patient record using natural language questions like "When was the last A1C?" or "What medications has this patient tried for hypertension?"</li>
              </ul>
              <p>
                PracticeFlux AI Module is built specifically for healthcare, with HIPAA-compliant processing and medical-grade accuracy that providers can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ambient AI Scribe Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ambient AI Scribe - Automated Documentation</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                The Ambient AI Scribe is a breakthrough technology that listens to patient encounters and automatically generates clinical documentation. Providers can focus entirely on the patient while AI handles the note-taking.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Passive Listening:</strong> AI listens to the natural conversation between provider and patient without requiring special commands, wake words, or structured speech.</li>
                <li><strong>Speaker Diarization:</strong> Automatically distinguishes between provider speech and patient speech to accurately attribute information in the note.</li>
                <li><strong>Clinical Extraction:</strong> Extracts symptoms, history, physical findings, diagnoses, and treatment plans from the conversation and organizes them appropriately.</li>
                <li><strong>SOAP Note Generation:</strong> Produces properly formatted SOAP notes with Subjective, Objective, Assessment, and Plan sections following documentation best practices.</li>
                <li><strong>Template Adaptation:</strong> Adapts output to match your specialty and documentation preferences. Learn your style over time for increasingly personalized results.</li>
                <li><strong>Review and Sign:</strong> Notes are presented for provider review and editing before signing. Make quick adjustments and sign off in seconds instead of minutes.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Decision Support Explained */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Clinical Decision Support</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                AI-powered clinical decision support provides real-time guidance during patient encounters, helping providers make evidence-based decisions.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Diagnostic Suggestions:</strong> Based on documented symptoms, findings, and patient history, AI suggests possible diagnoses ranked by likelihood with supporting evidence.</li>
                <li><strong>Guideline Integration:</strong> Access relevant clinical guidelines from sources like USPSTF, AHA, ADA, and specialty societies directly in the workflow.</li>
                <li><strong>Risk Calculations:</strong> Automatically calculate clinical risk scores like ASCVD, CHA2DS2-VASc, CURB-65, and others based on patient data.</li>
                <li><strong>Drug Interactions:</strong> Real-time alerts for drug-drug interactions, drug-allergy conflicts, duplicate therapies, and contraindications with severity levels.</li>
                <li><strong>Dosage Guidance:</strong> Suggestions for appropriate dosing based on patient factors like age, weight, renal function, and hepatic function.</li>
                <li><strong>Care Gap Alerts:</strong> Notifications when patients are due for preventive care, screenings, or chronic disease monitoring during the encounter.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Automated Coding Explained */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">AI-Powered Medical Coding</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Accurate medical coding is essential for proper reimbursement and compliance. AI analyzes your documentation and suggests the most accurate codes.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>ICD-10 Suggestions:</strong> AI reads your assessment and suggests appropriate ICD-10 diagnosis codes with specificity recommendations (laterality, episode of care, etc.).</li>
                <li><strong>CPT Recommendations:</strong> Based on services documented, AI recommends appropriate CPT procedure codes including E/M level with supporting documentation elements.</li>
                <li><strong>E/M Level Justification:</strong> See exactly which documentation elements support each E/M level. Identify opportunities to document additional complexity when warranted.</li>
                <li><strong>Modifier Suggestions:</strong> AI identifies when modifiers are needed (25, 59, etc.) based on the services and diagnoses documented.</li>
                <li><strong>Coding Compliance:</strong> Built-in rules check for common coding errors, bundling issues, and medical necessity to prevent compliance problems.</li>
                <li><strong>Documentation Gaps:</strong> Alerts when documentation is insufficient to support the code level, giving you the opportunity to add details before claim submission.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How AI Enhances Your Practice</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100 mb-4">
                  <useCase.icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                See AI in Action
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  The PracticeFlux AI Assistant works silently in the background during your patient encounters. It listens to the natural conversation between you and your patient, understanding context and clinical details.
                </p>
                <p>
                  As you discuss symptoms and findings, AI generates diagnostic suggestions with supporting evidence. When you prescribe medications, it checks for interactions and contraindications in real-time.
                </p>
                <p>
                  After the encounter, a complete SOAP note is waiting for your review. Just verify, make any adjustments, and sign off. What used to take 15 minutes now takes 2.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-green-600">Active - Listening...</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-purple-900">Diagnostic Suggestion</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Based on fever, productive cough, and bilateral rhonchi, consider <strong>Acute Bronchitis (J20.9)</strong>
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm font-medium text-yellow-900">Drug Interaction Alert</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Moderate interaction: Azithromycin + Warfarin may increase bleeding risk
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-900">Coding Recommendation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    E/M Level: 99214 - Moderate complexity, supported by documentation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Core Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                    <capability.icon className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{capability.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Built for Healthcare</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our AI is specifically designed for healthcare with privacy and security at its core.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: 'HIPAA Compliant', description: 'All AI processing is fully HIPAA compliant' },
                { title: 'No Data Training', description: 'Your patient data is never used to train models' },
                { title: 'On-Premise Option', description: 'Enterprise customers can deploy on-premise' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Practice with AI?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join providers saving 2+ hours daily with AI-powered assistance.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/modules/quality">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View Quality Module
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
