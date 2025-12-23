import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  Users,
  Smartphone,
  BarChart3,
  Zap,
} from 'lucide-react'

const benefits = [
  {
    title: 'Reduce No-Shows by 40%',
    description: 'AI-powered predictive analytics identify high-risk appointments and trigger proactive outreach.',
    icon: BarChart3,
  },
  {
    title: 'Automated Reminders',
    description: 'Multi-channel reminders via SMS, email, and voice calls with customizable timing and messaging.',
    icon: Bell,
  },
  {
    title: 'Smart Waitlist Management',
    description: 'Automatically fill cancellation slots from your waitlist based on patient preferences and availability.',
    icon: Users,
  },
  {
    title: 'Patient Self-Scheduling',
    description: 'Let patients book appointments 24/7 through your patient portal with real-time availability.',
    icon: Smartphone,
  },
]

const features = [
  'Drag-and-drop calendar interface with intuitive controls',
  'Color-coded appointment types for quick visual identification',
  'Multi-provider and multi-location scheduling in a single view',
  'Recurring appointment patterns for regular visits',
  'Buffer time management between appointments',
  'Overbooking controls with automatic alerts',
  'Real-time insurance eligibility verification at booking',
  'Appointment type templates with configurable durations',
  'Provider availability management and time-off tracking',
  'Room and resource scheduling',
  'Wait time tracking and alerts',
  'Two-way SMS communication with patients',
]

const stats = [
  { value: '40%', label: 'Reduction in No-Shows' },
  { value: '25%', label: 'More Appointments Filled' },
  { value: '90%', label: 'Patient Satisfaction' },
  { value: '2hrs', label: 'Saved Per Day' },
]

export default function SmartSchedulingPage() {
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
              <Calendar className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Smart Scheduling</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            AI-powered appointment scheduling that optimizes your calendar, reduces no-shows, and keeps your practice running at peak efficiency.
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

      {/* What is Smart Scheduling */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Smart Scheduling?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Smart Scheduling</strong> is an AI-powered appointment management system that goes beyond basic calendar functions. It uses machine learning algorithms to analyze scheduling patterns, predict patient behavior, and automatically optimize your practice calendar for maximum efficiency.
              </p>
              <p>
                Smart scheduling addresses the biggest challenges in healthcare practice management:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>No-show prediction:</strong> AI analyzes patient history, appointment type, day of week, and other factors to identify appointments at high risk of no-show before they happen.</li>
                <li><strong>Automated reminders:</strong> Multi-channel reminders via SMS, email, and voice calls are sent at optimal times to maximize confirmation rates.</li>
                <li><strong>Waitlist management:</strong> When cancellations occur, the system automatically offers the slot to waitlisted patients based on their preferences and availability.</li>
                <li><strong>Patient self-scheduling:</strong> Patients can book appointments 24/7 through your portal with real-time availability, reducing phone calls by up to 60%.</li>
                <li><strong>Overbooking intelligence:</strong> The system suggests strategic overbooking for high-risk slots while protecting against schedule overload.</li>
                <li><strong>Resource optimization:</strong> Automatically balance provider schedules, room assignments, and equipment availability.</li>
              </ul>
              <p>
                The result is a practice that runs at peak efficiency with fewer empty slots, happier staff, and better patient access.
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
                Intelligent Scheduling That Works For You
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Predictive No-Show Analytics:</strong> Our machine learning model analyzes over 50 variables including patient demographics, appointment history, weather, and day of week to predict which appointments are at risk. High-risk appointments trigger proactive outreach before it's too late.
                </p>
                <p>
                  <strong>Smart Reminder Sequences:</strong> Configure multi-touch reminder campaigns with the optimal timing for your patient population. Patients can confirm, cancel, or reschedule directly from reminder messages.
                </p>
                <p>
                  <strong>Dynamic Waitlist:</strong> When a cancellation occurs, the system automatically matches the open slot with waitlisted patients based on their stated preferences, availability, and appointment urgency.
                </p>
                <p>
                  <strong>Provider Schedule Templates:</strong> Create recurring schedule templates for each provider with different appointment types, durations, and buffer times. Easily handle time off, schedule changes, and locum coverage.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Today&apos;s Schedule</h3>
                  <span className="text-sm text-teal-600">24 appointments</span>
                </div>
                <div className="space-y-3">
                  {[
                    { time: '9:00 AM', patient: 'Sarah Johnson', type: 'Annual Physical', status: 'confirmed' },
                    { time: '9:30 AM', patient: 'Michael Chen', type: 'Follow-up', status: 'confirmed' },
                    { time: '10:00 AM', patient: 'Emily Davis', type: 'New Patient', status: 'at-risk' },
                    { time: '10:30 AM', patient: 'Robert Wilson', type: 'Lab Review', status: 'confirmed' },
                  ].map((apt, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 w-20">{apt.time}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{apt.patient}</div>
                        <div className="text-xs text-gray-500">{apt.type}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status === 'confirmed' ? 'Confirmed' : 'At Risk'}
                      </div>
                    </div>
                  ))}
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
              Everything you need to optimize your scheduling workflow
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
            <h2 className="text-3xl font-bold text-gray-900">All Scheduling Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools to manage every aspect of your calendar
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

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Configure Your Settings',
                description: 'Set up appointment types, durations, provider schedules, and reminder preferences.',
              },
              {
                step: '2',
                title: 'AI Learns Your Patterns',
                description: 'Our system analyzes your scheduling data to identify no-show risks and optimization opportunities.',
              },
              {
                step: '3',
                title: 'Automated Optimization',
                description: 'Smart reminders go out automatically, cancellations are filled from waitlists, and your calendar stays full.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Schedule?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Join thousands of practices using PracticeFlux to reduce no-shows and maximize efficiency.
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
