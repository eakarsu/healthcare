'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

const contactMethods = [
  {
    name: 'Sales',
    description: 'Talk to our sales team about pricing and features.',
    email: 'sales@practiceflux.com',
    phone: '1-888-PFLUX-01',
    icon: MessageSquare,
  },
  {
    name: 'Support',
    description: 'Get help with your existing account.',
    email: 'support@practiceflux.com',
    phone: '1-888-PFLUX-02',
    icon: Phone,
  },
  {
    name: 'General',
    description: 'For partnerships and media inquiries.',
    email: 'hello@practiceflux.com',
    phone: '1-888-PFLUX-00',
    icon: Mail,
  },
]

const offices = [
  {
    city: 'Richmond',
    address: '2807 Hampton Woods Dr',
    state: 'Richmond, VA 23233',
    type: 'Headquarters',
  },
]

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    setFormState('success')
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Have questions about PracticeFlux? Our team is here to help. Reach out and we&apos;ll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {contactMethods.map((method) => (
              <div key={method.name} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                  <method.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{method.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{method.description}</p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-teal-600">{method.email}</p>
                  <p className="text-sm text-gray-500">{method.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
              <p className="mt-2 text-gray-600">Fill out the form and we&apos;ll be in touch soon.</p>

              {formState === 'success' ? (
                <div className="mt-8 text-center py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Message Sent!</h3>
                  <p className="mt-2 text-gray-600">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <Button
                    className="mt-6 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => setFormState('idle')}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="mt-1"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="mt-1"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="practiceName">Practice name</Label>
                    <Input
                      id="practiceName"
                      name="practiceName"
                      type="text"
                      className="mt-1"
                      placeholder="ABC Medical Group"
                    />
                  </div>

                  <div>
                    <Label htmlFor="practiceSize">Practice size</Label>
                    <Select name="practiceSize">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select practice size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo practitioner</SelectItem>
                        <SelectItem value="2-5">2-5 providers</SelectItem>
                        <SelectItem value="6-10">6-10 providers</SelectItem>
                        <SelectItem value="11-25">11-25 providers</SelectItem>
                        <SelectItem value="26+">26+ providers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="interest">I&apos;m interested in</Label>
                    <Select name="interest">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Scheduling a demo</SelectItem>
                        <SelectItem value="pricing">Pricing information</SelectItem>
                        <SelectItem value="features">Feature questions</SelectItem>
                        <SelectItem value="support">Technical support</SelectItem>
                        <SelectItem value="partnership">Partnership opportunities</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={formState === 'submitting'}
                  >
                    {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                    {formState !== 'submitting' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              {/* Response time */}
              <div className="bg-teal-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4">
                  <Clock className="h-8 w-8 text-teal-200" />
                  <div>
                    <h3 className="text-lg font-semibold">Quick Response</h3>
                    <p className="text-teal-100">We respond to all inquiries within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Office locations */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Our Offices</h3>
                <div className="space-y-6">
                  {offices.map((office) => (
                    <div key={office.city} className="flex gap-4">
                      <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{office.city}</p>
                        <p className="text-sm text-gray-600">{office.address}</p>
                        <p className="text-sm text-gray-600">{office.state}</p>
                        <p className="text-xs text-teal-600 mt-1">{office.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support hours */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales Team</span>
                    <span className="text-gray-900">Mon-Fri, 8am-8pm ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technical Support</span>
                    <span className="text-gray-900">Mon-Fri, 7am-10pm ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enterprise Support</span>
                    <span className="text-gray-900">24/7</span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-gray-100 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/features" className="flex items-center text-teal-600 hover:text-teal-700">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View all features
                  </Link>
                  <Link href="/pricing" className="flex items-center text-teal-600 hover:text-teal-700">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    See pricing plans
                  </Link>
                  <Link href="/login" className="flex items-center text-teal-600 hover:text-teal-700">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Common Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Quick answers to frequently asked questions
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="space-y-6">
              {[
                {
                  question: 'How long does implementation take?',
                  answer: 'Most practices are up and running within 2-4 weeks. We provide full onboarding support and data migration assistance.',
                },
                {
                  question: 'Do you offer data migration?',
                  answer: 'Yes, we can migrate data from most major EHR systems. Our team handles the entire process to ensure a smooth transition.',
                },
                {
                  question: 'Is training included?',
                  answer: 'All plans include access to our comprehensive knowledge base and video tutorials. Professional and Enterprise plans include live training sessions.',
                },
                {
                  question: 'Can I try before I buy?',
                  answer: 'Absolutely! We offer a 14-day free trial with full access to all features. No credit card required to start.',
                },
              ].map((faq) => (
                <div key={faq.question} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/pricing#faq" className="text-teal-600 font-medium hover:text-teal-700">
                View all FAQs <ArrowRight className="inline ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              Join thousands of healthcare providers who trust PracticeFlux.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
