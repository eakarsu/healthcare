import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Calendar,
  FileText,
  DollarSign,
  Brain,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Lock,
  HeartPulse,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'PracticeFlux - Modern Healthcare Practice Management Software',
  description: 'All-in-one HIPAA-compliant EHR, billing, scheduling, and AI-powered clinical tools. Trusted by 5,000+ healthcare practices. Start your free trial today.',
  openGraph: {
    title: 'PracticeFlux - Modern Healthcare Practice Management Software',
    description: 'All-in-one HIPAA-compliant EHR, billing, scheduling, and AI-powered clinical tools. Trusted by 5,000+ healthcare practices.',
  },
}

const features = [
  {
    name: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling that optimizes your calendar and reduces no-shows.',
    icon: Calendar,
    href: '/features/smart-scheduling',
  },
  {
    name: 'Clinical Workflows',
    description: 'Streamlined SOAP notes, e-prescriptions, and lab orders in one unified interface.',
    icon: FileText,
    href: '/features/clinical-workflows',
  },
  {
    name: 'Revenue Cycle Management',
    description: 'Automated billing, claims submission, and payment tracking for faster reimbursements.',
    icon: DollarSign,
    href: '/features/revenue-cycle',
  },
  {
    name: 'AI Clinical Assistant',
    description: 'Get AI-powered diagnostic suggestions, coding assistance, and documentation help.',
    icon: Brain,
    href: '/features/ai-assistant',
  },
  {
    name: 'Quality & MIPS Tracking',
    description: 'Real-time quality measure tracking to maximize your MIPS scores and avoid penalties.',
    icon: BarChart3,
    href: '/features/quality-mips',
  },
  {
    name: 'Patient Engagement',
    description: 'Patient portal, appointment reminders, and secure messaging to improve satisfaction.',
    icon: Users,
    href: '/features/patient-engagement',
  },
]

const modules = [
  {
    title: 'Clinical Module',
    description: 'Complete EHR functionality with SOAP notes, e-prescriptions, lab integration, and imaging orders.',
    icon: HeartPulse,
    color: 'bg-red-100 text-red-600',
    href: '/modules/clinical',
  },
  {
    title: 'Billing Module',
    description: 'End-to-end revenue cycle management from charge capture to payment posting.',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    href: '/modules/billing',
  },
  {
    title: 'AI Assistant',
    description: 'Clinical decision support, automated coding suggestions, and documentation assistance.',
    icon: Brain,
    color: 'bg-purple-100 text-purple-600',
    href: '/modules/ai',
  },
  {
    title: 'Quality Module',
    description: 'Track MIPS measures, identify care gaps, and generate CMS-ready reports.',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-600',
    href: '/modules/quality',
  },
]

const testimonials = [
  {
    content: 'PracticeFlux has transformed our practice. We reduced claim denials by 40% and improved our MIPS score from 60 to 92 in just one year.',
    author: 'Dr. Sarah Chen',
    role: 'Family Medicine, Houston TX',
    rating: 5,
  },
  {
    content: 'The AI assistant helps me document encounters 3x faster. I can finally leave the office on time and spend more time with my family.',
    author: 'Dr. Michael Rodriguez',
    role: 'Internal Medicine, Phoenix AZ',
    rating: 5,
  },
  {
    content: 'Implementation was seamless. The support team worked with us every step of the way, and we were fully operational in just 2 weeks.',
    author: 'Dr. Emily Thompson',
    role: 'Practice Administrator, Seattle WA',
    rating: 5,
  },
]

const stats = [
  { value: '5,000+', label: 'Healthcare Providers' },
  { value: '2M+', label: 'Patients Served' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '$50M+', label: 'Claims Processed Monthly' },
]

const pricingTiers = [
  {
    name: 'Starter',
    price: '299',
    description: 'Perfect for solo practitioners getting started.',
    features: ['Up to 2 providers', 'Basic scheduling', 'SOAP notes', 'Patient portal', 'Email support'],
  },
  {
    name: 'Professional',
    price: '599',
    description: 'Ideal for growing practices with multiple providers.',
    features: ['Up to 10 providers', 'AI clinical assistant', 'Full RCM suite', 'MIPS tracking', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large practices and healthcare organizations.',
    features: ['Unlimited providers', 'Custom integrations', 'Dedicated success manager', 'Advanced analytics', '24/7 phone support'],
  },
]

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-inset ring-teal-700/10">
                HIPAA Compliant & SOC 2 Certified
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Modern Healthcare Practice Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your clinical workflows, maximize reimbursements, and deliver better patient care with PracticeFlux&apos;s all-in-one healthcare management platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  View Features
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-200 to-cyan-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Trusted by healthcare practices across America
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-6">
            {['Family Care Associates', 'Metro Health Partners', 'Sunrise Medical Group', 'Valley Internal Medicine', 'Premier Pediatrics'].map((name) => (
              <div key={name} className="text-gray-400 font-semibold text-lg">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-teal-600">Everything You Need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              One Platform, Complete Practice Management
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From patient scheduling to quality reporting, PracticeFlux handles every aspect of your practice operations.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="relative bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                      <feature.icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshot */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Intuitive Dashboard, Powerful Insights
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get a complete view of your practice performance at a glance. Track appointments, revenue, and quality metrics all in one place.
            </p>
          </div>
          <div className="mt-16 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
            <div className="rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 p-8 lg:p-12 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-teal-200 text-sm font-medium">Today&apos;s Appointments</div>
                  <div className="text-white text-3xl font-bold mt-2">24</div>
                  <div className="text-teal-200 text-sm mt-1">3 remaining</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-teal-200 text-sm font-medium">Monthly Revenue</div>
                  <div className="text-white text-3xl font-bold mt-2">$127,450</div>
                  <div className="text-green-300 text-sm mt-1">+12.5% from last month</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-teal-200 text-sm font-medium">MIPS Score</div>
                  <div className="text-white text-3xl font-bold mt-2">92.4</div>
                  <div className="text-teal-200 text-sm mt-1">On track for bonus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Integrated Modules for Complete Care
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Each module works seamlessly together, eliminating data silos and streamlining your workflows.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
            {modules.map((module) => (
              <div
                key={module.title}
                className="relative bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${module.color}`}>
                  <module.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{module.title}</h3>
                <p className="mt-2 text-gray-600">{module.description}</p>
                <Link
                  href={module.href}
                  className="mt-4 inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Healthcare Providers
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See what our customers have to say about transforming their practices with PracticeFlux.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col bg-gray-50 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-gray-700">
                  &quot;{testimonial.content}&quot;
                </blockquote>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-teal-600">
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

      {/* Pricing Preview */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that fits your practice. All plans include core features with no hidden fees.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-teal-600 text-white ring-2 ring-teal-600'
                    : 'bg-white ring-1 ring-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-4 py-1 text-xs font-semibold text-teal-700">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <p className={`mt-2 text-sm ${tier.popular ? 'text-teal-100' : 'text-gray-500'}`}>
                  {tier.description}
                </p>
                <div className="mt-6">
                  <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                    {tier.price === 'Custom' ? 'Custom' : `$${tier.price}`}
                  </span>
                  {tier.price !== 'Custom' && (
                    <span className={`text-sm ${tier.popular ? 'text-teal-100' : 'text-gray-500'}`}>
                      /month
                    </span>
                  )}
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 ${tier.popular ? 'text-teal-200' : 'text-teal-600'}`} />
                      <span className={`text-sm ${tier.popular ? 'text-teal-100' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="mt-8 block">
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? 'bg-white text-teal-600 hover:bg-teal-50'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/pricing" className="text-teal-600 font-medium hover:text-teal-700">
              View full pricing details <ArrowRight className="inline ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enterprise-Grade Security
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Your patient data is protected with the highest security standards in the industry.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">HIPAA Compliant</h3>
              <p className="mt-2 text-sm text-gray-500">
                Full compliance with HIPAA regulations. BAA available for all customers.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Lock className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">SOC 2 Type II</h3>
              <p className="mt-2 text-sm text-gray-500">
                Independently audited security controls and data protection practices.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Zap className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">99.9% Uptime</h3>
              <p className="mt-2 text-sm text-gray-500">
                Redundant infrastructure ensures your practice never skips a beat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Practice?
            </h2>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              Join thousands of healthcare providers who have streamlined their operations with PracticeFlux. Start your free trial today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 px-8">
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
            <p className="mt-4 text-sm text-teal-200">
              <Clock className="inline mr-1 h-4 w-4" />
              No credit card required. Setup in under 5 minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
