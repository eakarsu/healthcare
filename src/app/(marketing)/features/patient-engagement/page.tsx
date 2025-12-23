import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Smartphone,
  MessageSquare,
  Calendar,
  Video,
  Bell,
  FileText,
} from 'lucide-react'

const benefits = [
  {
    title: 'Patient Portal',
    description: '24/7 access to records, appointments, messages, and bill pay from any device.',
    icon: Smartphone,
  },
  {
    title: 'Secure Messaging',
    description: 'HIPAA-compliant messaging between patients and care team with read receipts.',
    icon: MessageSquare,
  },
  {
    title: 'Online Scheduling',
    description: 'Patients book their own appointments with real-time availability display.',
    icon: Calendar,
  },
  {
    title: 'Telehealth Integration',
    description: 'Video visits directly through the patient portal with no downloads required.',
    icon: Video,
  },
]

const features = [
  'Patient portal web and mobile apps',
  'Secure messaging with care team',
  'Online appointment scheduling',
  'Appointment reminder notifications',
  'SMS, email, and voice reminders',
  'Digital intake forms',
  'Pre-visit questionnaires',
  'Lab results viewing',
  'Medication list access',
  'Visit summary viewing',
  'Telehealth video visits',
  'Online bill pay',
  'Payment plan setup',
  'Prescription refill requests',
  'Referral status tracking',
  'Patient satisfaction surveys',
  'Educational content delivery',
  'Family account linking',
]

const stats = [
  { value: '85%', label: 'Portal Adoption' },
  { value: '60%', label: 'Fewer Phone Calls' },
  { value: '40%', label: 'Fewer No-Shows' },
  { value: '4.8/5', label: 'Patient Satisfaction' },
]

export default function PatientEngagementPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-cyan-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-100">
              <Users className="h-8 w-8 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Patient Engagement</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Modern patient engagement tools that improve communication, increase satisfaction, and keep patients actively involved in their healthcare journey.
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
      <section className="py-16 bg-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-cyan-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Patient Engagement */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Patient Engagement?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Patient Engagement</strong> refers to the strategies, tools, and technologies that encourage patients to actively participate in their own healthcare. It encompasses everything from digital communication and self-service portals to health education and shared decision-making.
              </p>
              <p>
                Effective patient engagement is essential for modern healthcare practices for several reasons:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Improved health outcomes:</strong> Engaged patients are more likely to follow treatment plans, take medications as prescribed, and attend follow-up appointments.</li>
                <li><strong>Higher patient satisfaction:</strong> Patients who can easily communicate with their care team and access their health information report significantly higher satisfaction scores.</li>
                <li><strong>Reduced administrative burden:</strong> Self-service tools like online scheduling, digital intake forms, and secure messaging reduce phone call volume and staff workload.</li>
                <li><strong>Better care coordination:</strong> Secure messaging and portal access enable faster communication between patients and their entire care team.</li>
                <li><strong>Increased patient retention:</strong> Practices with strong patient engagement tools retain more patients and receive more referrals.</li>
                <li><strong>Lower no-show rates:</strong> Automated reminders and easy rescheduling options significantly reduce missed appointments.</li>
                <li><strong>Faster payments:</strong> Online bill pay and transparent pricing improve collection rates and patient financial satisfaction.</li>
              </ul>
              <p>
                PracticeFlux provides a complete patient engagement platform including patient portal, secure messaging, online scheduling, telehealth, and automated communications.
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
                Complete Patient Engagement Platform
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Patient Portal:</strong> A secure, mobile-friendly portal where patients can view their health records, lab results, medications, and visit summaries. Available as a web application and native iOS/Android apps.
                </p>
                <p>
                  <strong>Secure Messaging:</strong> HIPAA-compliant messaging between patients and their care team with read receipts and response time tracking. Patients can attach photos and documents to messages.
                </p>
                <p>
                  <strong>Automated Communications:</strong> Multi-channel appointment reminders, preventive care notifications, and health maintenance alerts sent via SMS, email, and voice at optimal times.
                </p>
                <p>
                  <strong>Digital Intake:</strong> Patients complete registration forms, medical history questionnaires, and consent documents online before their visit, saving time and improving data accuracy.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-teal-600 p-4 text-white">
                  <h3 className="font-semibold">PracticeFlux Patient Portal</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: Calendar, label: 'Appointments' },
                      { icon: MessageSquare, label: 'Messages' },
                      { icon: FileText, label: 'Records' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                        <item.icon className="h-6 w-6 mx-auto text-teal-600 mb-1" />
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Appointment reminder: Tomorrow at 10:00 AM</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Lab results ready to view</span>
                      </div>
                    </div>
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
              Tools that patients love and practices need
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Journey */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">The Digital Patient Journey</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            {[
              { step: '1', title: 'Book Online', description: 'Patient schedules via portal' },
              { step: '2', title: 'Get Reminders', description: 'Automated SMS/email reminders' },
              { step: '3', title: 'Complete Intake', description: 'Digital forms before visit' },
              { step: '4', title: 'Visit', description: 'In-person or telehealth' },
              { step: '5', title: 'Follow Up', description: 'View results, message provider' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white font-bold text-xl mb-4">
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
            <h2 className="text-3xl font-bold text-gray-900">All Engagement Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Complete tools for modern patient engagement
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <CheckCircle className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Engage Your Patients?
          </h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Join practices with 85% portal adoption and 4.8/5 patient satisfaction.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50">
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
