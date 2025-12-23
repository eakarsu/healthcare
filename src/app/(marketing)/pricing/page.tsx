import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, X, ArrowRight, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - Affordable Healthcare Practice Management',
  description: 'Transparent pricing for PracticeFlux EHR and practice management. Plans starting at $249/month. No hidden fees. Free trial available.',
  openGraph: {
    title: 'PracticeFlux Pricing - EHR & Practice Management',
    description: 'Compare pricing plans: Starter, Professional, and Enterprise. Find the right plan for your practice.',
  },
}

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    price: { monthly: '299', annually: '249' },
    description: 'Perfect for solo practitioners and small practices just getting started.',
    features: [
      { name: 'Up to 2 providers', included: true },
      { name: 'Unlimited patients', included: true },
      { name: 'Basic scheduling', included: true },
      { name: 'SOAP notes with templates', included: true },
      { name: 'Patient portal', included: true },
      { name: 'Basic reporting', included: true },
      { name: 'Email support', included: true },
      { name: 'E-Prescribing', included: false },
      { name: 'AI clinical assistant', included: false },
      { name: 'Full RCM suite', included: false },
      { name: 'MIPS tracking', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free Trial',
    mostPopular: false,
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    price: { monthly: '599', annually: '499' },
    description: 'Ideal for growing practices with multiple providers and comprehensive needs.',
    features: [
      { name: 'Up to 10 providers', included: true },
      { name: 'Unlimited patients', included: true },
      { name: 'Advanced scheduling with AI optimization', included: true },
      { name: 'SOAP notes with AI assistance', included: true },
      { name: 'Patient portal with messaging', included: true },
      { name: 'Advanced analytics dashboard', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'E-Prescribing (EPCS)', included: true },
      { name: 'AI clinical assistant', included: true },
      { name: 'Full RCM suite', included: true },
      { name: 'MIPS tracking', included: true },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free Trial',
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    price: { monthly: 'Custom', annually: 'Custom' },
    description: 'For large practices and healthcare organizations with advanced requirements.',
    features: [
      { name: 'Unlimited providers', included: true },
      { name: 'Unlimited patients', included: true },
      { name: 'Advanced scheduling with AI optimization', included: true },
      { name: 'SOAP notes with AI assistance', included: true },
      { name: 'Patient portal with messaging', included: true },
      { name: 'Custom analytics & BI integration', included: true },
      { name: '24/7 phone & dedicated support', included: true },
      { name: 'E-Prescribing (EPCS)', included: true },
      { name: 'AI clinical assistant', included: true },
      { name: 'Full RCM suite', included: true },
      { name: 'MIPS tracking', included: true },
      { name: 'API access & custom integrations', included: true },
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
]

const addOns = [
  {
    name: 'Lab Integration',
    description: 'Bidirectional integration with Quest, LabCorp, and local labs',
    price: '$99/mo',
  },
  {
    name: 'Telehealth',
    description: 'HIPAA-compliant video visits with virtual waiting room',
    price: '$149/mo',
  },
  {
    name: 'SMS Reminders',
    description: 'Two-way SMS for appointment reminders and patient communication',
    price: '$79/mo',
  },
  {
    name: 'Additional Provider',
    description: 'Add more providers beyond your plan limit',
    price: '$99/mo per provider',
  },
]

const faqs = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans include a 14-day free trial with full access to features. No credit card required to start.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH bank transfers, and can invoice annually for Enterprise customers.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for Starter and Professional plans. Enterprise plans may include implementation services.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, save approximately 17% when you choose annual billing vs. monthly.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You can export all your data before cancellation. We retain data for 90 days after cancellation per HIPAA requirements.',
  },
  {
    question: 'Is PracticeFlux HIPAA compliant?',
    answer: 'Yes, we are fully HIPAA compliant and will sign a Business Associate Agreement (BAA) with all customers.',
  },
  {
    question: 'Do you provide training?',
    answer: 'All plans include access to our knowledge base and video tutorials. Professional and Enterprise plans include live training sessions.',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that fits your practice. All plans include core features with no hidden fees. Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-8 ${
                  tier.mostPopular
                    ? 'bg-teal-600 text-white ring-2 ring-teal-600 scale-105'
                    : 'bg-white ring-1 ring-gray-200'
                }`}
              >
                {tier.mostPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-4 py-1 text-xs font-semibold text-teal-700">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold ${tier.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <p className={`mt-2 text-sm ${tier.mostPopular ? 'text-teal-100' : 'text-gray-500'}`}>
                  {tier.description}
                </p>

                <div className="mt-6">
                  {tier.price.monthly === 'Custom' ? (
                    <span className={`text-4xl font-bold ${tier.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-bold ${tier.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                        ${tier.price.monthly}
                      </span>
                      <span className={`text-sm ${tier.mostPopular ? 'text-teal-100' : 'text-gray-500'}`}>
                        /month
                      </span>
                      <p className={`mt-1 text-sm ${tier.mostPopular ? 'text-teal-200' : 'text-gray-400'}`}>
                        or ${tier.price.annually}/mo billed annually
                      </p>
                    </>
                  )}
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${tier.mostPopular ? 'text-teal-200' : 'text-teal-600'}`} />
                      ) : (
                        <X className={`h-5 w-5 flex-shrink-0 ${tier.mostPopular ? 'text-teal-300/50' : 'text-gray-300'}`} />
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? tier.mostPopular ? 'text-teal-100' : 'text-gray-600'
                          : tier.mostPopular ? 'text-teal-300/50' : 'text-gray-400'
                      }`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.cta === 'Contact Sales' ? '/contact' : '/login'} className="mt-8 block">
                  <Button
                    className={`w-full ${
                      tier.mostPopular
                        ? 'bg-white text-teal-600 hover:bg-teal-50'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Optional Add-ons
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Enhance your plan with additional capabilities
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {addOns.map((addOn) => (
                <div
                  key={addOn.name}
                  className="flex items-start justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{addOn.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{addOn.description}</p>
                  </div>
                  <div className="text-sm font-semibold text-teal-600">{addOn.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Compare Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See which plan is right for your practice
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-5xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-teal-600">Professional</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Providers', starter: '2', professional: '10', enterprise: 'Unlimited' },
                  { feature: 'Patients', starter: 'Unlimited', professional: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Scheduling', starter: 'Basic', professional: 'AI-Optimized', enterprise: 'AI-Optimized' },
                  { feature: 'SOAP Notes', starter: 'Templates', professional: 'AI-Assisted', enterprise: 'AI-Assisted' },
                  { feature: 'E-Prescribing', starter: false, professional: true, enterprise: true },
                  { feature: 'AI Clinical Assistant', starter: false, professional: true, enterprise: true },
                  { feature: 'Revenue Cycle Management', starter: false, professional: true, enterprise: true },
                  { feature: 'MIPS Tracking', starter: false, professional: true, enterprise: true },
                  { feature: 'API Access', starter: false, professional: false, enterprise: true },
                  { feature: 'Custom Integrations', starter: false, professional: false, enterprise: true },
                  { feature: 'Support', starter: 'Email', professional: 'Priority', enterprise: '24/7 Phone' },
                  { feature: 'Training', starter: 'Self-service', professional: 'Live sessions', enterprise: 'Dedicated' },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 px-4 text-sm text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-sm">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <CheckCircle className="h-5 w-5 text-teal-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{row.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm bg-teal-50">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <CheckCircle className="h-5 w-5 text-teal-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-teal-700 font-medium">{row.professional}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <CheckCircle className="h-5 w-5 text-teal-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Have questions? We have answers.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <dl className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-white rounded-xl p-6 shadow-sm">
                  <dt className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </dt>
                  <dd className="mt-3 ml-8 text-sm text-gray-600">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Still have questions?{' '}
              <Link href="/contact" className="text-teal-600 font-medium hover:text-teal-700">
                Contact our sales team
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start Your Free Trial Today
            </h2>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              No credit card required. Get full access to all features for 14 days.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
