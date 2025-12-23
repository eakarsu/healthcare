import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Mic, Brain, Clock, Clipboard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SOAP Notes - Clinical Documentation Software',
  description: 'Structured SOAP note documentation with customizable templates, voice-to-text dictation, smart phrases, and AI-assisted note generation. Save 2+ hours daily.',
  openGraph: {
    title: 'SOAP Notes Documentation - PracticeFlux',
    description: 'Learn about SOAP note documentation: Subjective, Objective, Assessment, and Plan. Voice dictation, templates, and AI assistance.',
  },
}

export default function SOAPNotesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-red-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link href="/features" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Features
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Clinical Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">SOAP Notes</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Structured clinical documentation with customizable templates, voice-to-text dictation, and AI-assisted note generation for faster, more accurate charting.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">Schedule Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-red-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '70%', label: 'Faster Documentation' },
              { value: '50+', label: 'Template Library' },
              { value: '99%', label: 'Accuracy Rate' },
              { value: '2hrs', label: 'Saved Per Day' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is SOAP Notes */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is SOAP Notes Documentation?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>SOAP Notes</strong> is the standard format for clinical documentation used by healthcare providers worldwide. SOAP stands for <strong>Subjective, Objective, Assessment, and Plan</strong> - the four essential components of every patient encounter note.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Subjective:</strong> What the patient tells you - their symptoms, complaints, and medical history in their own words.</li>
                <li><strong>Objective:</strong> What you observe and measure - vital signs, physical exam findings, lab results, and diagnostic data.</li>
                <li><strong>Assessment:</strong> Your clinical judgment - diagnoses, differential diagnoses, and clinical impressions based on the subjective and objective data.</li>
                <li><strong>Plan:</strong> Your treatment strategy - medications prescribed, tests ordered, referrals made, patient education provided, and follow-up instructions.</li>
              </ul>
              <p>
                PracticeFlux SOAP Notes transforms this essential documentation process from a time-consuming burden into a streamlined, efficient workflow that saves you hours every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How PracticeFlux SOAP Notes Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Select Template', description: 'Choose from 50+ specialty-specific templates or create your own custom templates for your workflow.' },
              { step: '2', title: 'Auto-Populate Data', description: 'Patient demographics, medications, allergies, and vitals are automatically pulled into your note.' },
              { step: '3', title: 'Document Encounter', description: 'Type, dictate with voice-to-text, or use smart phrases to quickly capture the encounter details.' },
              { step: '4', title: 'AI Enhancement', description: 'AI suggests diagnoses, codes, and treatment plans based on your documentation.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Document Encounters Faster Than Ever
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Voice-to-Text Dictation:</strong> Our medical-grade speech recognition understands clinical terminology, medication names, and anatomical terms. Simply speak naturally and watch your note appear in real-time. Accuracy rates exceed 99% for medical vocabulary.
                </p>
                <p>
                  <strong>Smart Phrase Expansion:</strong> Create shortcuts for commonly used text blocks. Type ".hpi" and it expands into your full history of present illness template. Type ".pe" for your standard physical exam template. Save hours of typing every week.
                </p>
                <p>
                  <strong>AI-Assisted Documentation:</strong> As you document, AI analyzes your findings and suggests relevant diagnoses, ICD-10 codes, and treatment options. It learns your preferences over time to make increasingly accurate suggestions.
                </p>
                <p>
                  <strong>Template Customization:</strong> Start with our specialty templates for Family Medicine, Internal Medicine, Pediatrics, Cardiology, and 40+ other specialties. Then customize them to match your exact workflow and documentation style.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-semibold text-red-600 mb-1">SUBJECTIVE</p>
                    <p className="text-sm text-gray-700">Patient presents with 3-day history of productive cough and low-grade fever...</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 mb-1">OBJECTIVE</p>
                    <p className="text-sm text-gray-700">Temp: 99.8°F, BP: 128/82, HR: 88, RR: 18, SpO2: 97%...</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-semibold text-green-600 mb-1">ASSESSMENT</p>
                    <p className="text-sm text-gray-700">Acute bronchitis (J20.9)</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-semibold text-purple-600 mb-1">PLAN</p>
                    <p className="text-sm text-gray-700">1. Supportive care 2. Dextromethorphan PRN...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clipboard, title: 'Specialty Templates', description: 'Pre-built templates for 40+ specialties including family medicine, internal medicine, pediatrics, and more.' },
              { icon: Mic, title: 'Voice Dictation', description: 'Medical-grade speech recognition that understands clinical terminology and automatically formats notes.' },
              { icon: Brain, title: 'AI Suggestions', description: 'Intelligent suggestions for diagnoses, procedures, and treatment plans based on documented findings.' },
              { icon: Clock, title: 'Smart Phrases', description: 'Create custom shortcuts that expand into full text blocks, saving hours of typing each week.' },
              { icon: FileText, title: 'Auto-Population', description: 'Automatically pulls in relevant patient history, medications, allergies, and vitals.' },
              { icon: CheckCircle, title: 'Quality Checks', description: 'Built-in compliance checks ensure documentation meets billing and regulatory requirements.' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 mb-4">
                  <feature.icon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-rose-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Document Faster?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join thousands of clinicians saving 2+ hours daily on documentation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
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
