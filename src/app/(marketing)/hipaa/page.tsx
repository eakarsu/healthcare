import Link from 'next/link'
import { Shield, Lock, FileCheck, Server, Users, Bell, Database, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

const safeguards = [
  {
    title: 'Administrative Safeguards',
    icon: Users,
    items: [
      'Designated Privacy and Security Officers',
      'Workforce security training and awareness programs',
      'Background checks for all employees with PHI access',
      'Sanction policies for policy violations',
      'Regular risk assessments and security audits',
      'Incident response and breach notification procedures',
      'Business Associate Agreement management',
    ],
  },
  {
    title: 'Physical Safeguards',
    icon: Lock,
    items: [
      'SOC 2 Type II certified data centers',
      'Biometric access controls',
      '24/7 security monitoring and surveillance',
      'Environmental controls (fire, flood, temperature)',
      'Secure workstation and device policies',
      'Media disposal and destruction procedures',
    ],
  },
  {
    title: 'Technical Safeguards',
    icon: Server,
    items: [
      '256-bit AES encryption at rest',
      'TLS 1.3 encryption in transit',
      'Multi-factor authentication required',
      'Role-based access controls (RBAC)',
      'Automatic session timeout (15 minutes)',
      'Unique user identification and audit logging',
      'Intrusion detection and prevention systems',
    ],
  },
]

const certifications = [
  {
    name: 'HIPAA Compliant',
    description: 'Full compliance with HIPAA Privacy, Security, and Breach Notification Rules',
    icon: Shield,
  },
  {
    name: 'SOC 2 Type II',
    description: 'Independent audit of security, availability, and confidentiality controls',
    icon: FileCheck,
  },
  {
    name: 'HITRUST CSF',
    description: 'Healthcare-specific security framework certification',
    icon: Lock,
  },
]

export default function HIPAAPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-teal-100 p-4">
                <Shield className="h-12 w-12 text-teal-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              HIPAA Compliance
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              PracticeFlux is designed from the ground up to protect patient health information. We implement comprehensive administrative, physical, and technical safeguards to ensure HIPAA compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.name} className="text-center bg-gray-50 rounded-xl p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                  <cert.icon className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{cert.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
              Our HIPAA Commitment
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                As a Business Associate under HIPAA, PracticeFlux takes our responsibility to protect Protected Health Information (PHI) seriously. We are committed to:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Executing Business Associate Agreements (BAA)</strong> with all customers before handling PHI
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Lock className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Implementing required safeguards</strong> as specified in the HIPAA Security Rule
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Bell className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Reporting security incidents</strong> within required timeframes per the Breach Notification Rule
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Training all workforce members</strong> on HIPAA requirements and security best practices
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Database className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Maintaining proper data retention and disposal</strong> procedures for PHI
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Eye className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Conducting regular audits</strong> and risk assessments to identify and address vulnerabilities
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Safeguards */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-16">
            HIPAA Safeguards We Implement
          </h2>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {safeguards.map((safeguard) => (
              <div key={safeguard.title} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <safeguard.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{safeguard.title}</h3>
                </div>
                <ul className="space-y-3">
                  {safeguard.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              How We Protect Your Data
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Multiple layers of security ensure your patient data remains protected at all times.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Encryption at Rest', value: '256-bit AES', desc: 'All stored data encrypted' },
              { label: 'Encryption in Transit', value: 'TLS 1.3', desc: 'Secure communications' },
              { label: 'Session Timeout', value: '15 minutes', desc: 'HIPAA-compliant auto-logout' },
              { label: 'Audit Log Retention', value: '6 years', desc: 'Complete activity history' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className="text-3xl font-bold text-teal-400 mt-2">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAA Request */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
              Request a Business Associate Agreement
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We provide a Business Associate Agreement (BAA) to all customers at no additional charge.
              This agreement outlines our responsibilities for protecting PHI and ensures compliance with HIPAA requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                  Request BAA
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Security Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {[
              {
                q: 'Is PracticeFlux HIPAA compliant?',
                a: 'Yes, PracticeFlux is fully HIPAA compliant. We implement all required administrative, physical, and technical safeguards specified in the HIPAA Security Rule.',
              },
              {
                q: 'Do you sign Business Associate Agreements?',
                a: 'Yes, we execute a BAA with all customers before they store any PHI on our platform. The BAA is included at no additional cost.',
              },
              {
                q: 'How is patient data encrypted?',
                a: 'All data is encrypted using 256-bit AES encryption at rest and TLS 1.3 encryption in transit. Encryption keys are managed using industry-standard key management practices.',
              },
              {
                q: 'How long do you retain audit logs?',
                a: 'We retain comprehensive audit logs for 6 years, as required by HIPAA. Logs track all access to PHI and system activities.',
              },
              {
                q: 'What happens if there is a data breach?',
                a: 'We have a comprehensive incident response plan. In the event of a breach, we will notify affected customers within 24 hours and work with you to meet HIPAA breach notification requirements.',
              },
              {
                q: 'Where is data stored?',
                a: 'All data is stored in SOC 2 Type II certified data centers located in the United States. We do not store or process data outside the US.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Questions About Security?
            </h2>
            <p className="mt-6 text-lg text-teal-100">
              Our security team is available to answer your questions and provide additional documentation.
            </p>
            <div className="mt-8">
              <p className="text-teal-200">
                Email: security@practiceflux.com<br />
                Phone: 804-360-1129
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
