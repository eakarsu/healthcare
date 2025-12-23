import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle, Pill, AlertTriangle, Shield, Search, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'E-Prescriptions - EPCS Electronic Prescribing Software',
  description: 'EPCS-certified electronic prescribing with real-time drug interaction alerts, formulary checking, and 70,000+ pharmacy network. DEA compliant controlled substance prescribing.',
  openGraph: {
    title: 'E-Prescriptions & EPCS - PracticeFlux',
    description: 'Electronic prescribing with drug interaction checking, formulary integration, and EPCS for controlled substances.',
  },
}

export default function EPrescriptionsPage() {
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
              <Pill className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Clinical Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">E-Prescriptions</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            EPCS-certified electronic prescribing with real-time drug interaction alerts, formulary checking, and seamless pharmacy network integration.
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
              { value: '70K+', label: 'Pharmacies Connected' },
              { value: '100%', label: 'EPCS Certified' },
              { value: '99.9%', label: 'Delivery Success' },
              { value: '<5sec', label: 'Transmission Time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is E-Prescribing */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Electronic Prescribing?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Electronic Prescribing (E-Prescribing)</strong> is the computer-based generation, transmission, and filling of a medical prescription. Instead of handwriting or faxing prescriptions, providers send them electronically directly to the pharmacy of the patient's choice.
              </p>
              <p>
                E-Prescribing offers significant advantages over traditional paper prescriptions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eliminates handwriting errors:</strong> No more illegible prescriptions that can lead to dispensing errors.</li>
                <li><strong>Real-time safety checks:</strong> Automatic alerts for drug interactions, allergies, and contraindications.</li>
                <li><strong>Faster processing:</strong> Prescriptions arrive at the pharmacy instantly - no waiting for faxes or phone calls.</li>
                <li><strong>Controlled substance compliance:</strong> EPCS (Electronic Prescribing for Controlled Substances) meets DEA requirements for Schedule II-V medications.</li>
                <li><strong>Complete medication history:</strong> View what was prescribed, dispensed, and by whom across all providers.</li>
              </ul>
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
                Safe, Fast, and Compliant Prescribing
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Surescripts Network:</strong> PracticeFlux connects you to over 70,000 pharmacies nationwide through Surescripts, the nation's largest health information network. Send prescriptions to any retail, mail-order, or specialty pharmacy instantly.
                </p>
                <p>
                  <strong>Drug Interaction Checking:</strong> Before you prescribe, our system automatically checks for drug-drug interactions, drug-allergy conflicts, duplicate therapies, and contraindications based on the patient's conditions. Severity levels help you make informed decisions.
                </p>
                <p>
                  <strong>Formulary Integration:</strong> See real-time insurance formulary status, patient copay amounts, and tier information. When a prescribed drug isn't covered, the system suggests therapeutically equivalent alternatives that are on formulary.
                </p>
                <p>
                  <strong>EPCS Compliance:</strong> Our DEA-certified EPCS module allows you to prescribe Schedule II-V controlled substances electronically. Identity proofing, two-factor authentication, and audit trails ensure full regulatory compliance.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">New Prescription</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Amoxicillin 500mg</p>
                    <p className="text-xs text-gray-500">Take 1 capsule 3 times daily for 10 days</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm font-medium text-green-800">No Interactions Found</p>
                    <p className="text-xs text-green-600">Safe to prescribe with current medications</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Formulary Status: Tier 1</p>
                    <p className="text-xs text-blue-600">$10 copay - Preferred generic</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Send to: CVS Pharmacy</p>
                    <p className="text-xs text-gray-500">123 Main St, Richmond VA</p>
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
              { icon: Shield, title: 'EPCS Certified', description: 'DEA-compliant electronic prescribing for Schedule II-V controlled substances with identity proofing.' },
              { icon: AlertTriangle, title: 'Drug Interactions', description: 'Real-time alerts for drug-drug, drug-allergy, and drug-condition interactions before prescribing.' },
              { icon: Search, title: 'Formulary Lookup', description: 'Check insurance formulary coverage and see patient copay information before prescribing.' },
              { icon: RefreshCw, title: 'Refill Management', description: 'Manage refill requests electronically with one-click approval or denial with messaging.' },
              { icon: Pill, title: 'Medication History', description: 'View complete prescription history from all providers through Surescripts network.' },
              { icon: CheckCircle, title: 'Pharmacy Network', description: 'Connected to 70,000+ pharmacies including retail, mail-order, and specialty pharmacies.' },
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
            Ready to Prescribe Smarter?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join practices sending prescriptions safely and instantly.
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
