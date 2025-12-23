import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Heart,
  Shield,
  Users,
  Target,
  Linkedin,
  Twitter,
} from 'lucide-react'

const values = [
  {
    name: 'Patient-Centered',
    description: 'Every feature we build starts with the question: "How does this improve patient care?" We believe technology should enhance the provider-patient relationship, not complicate it.',
    icon: Heart,
  },
  {
    name: 'Security First',
    description: 'Healthcare data is sacred. We maintain the highest security standards, including HIPAA compliance, SOC 2 certification, and continuous security monitoring.',
    icon: Shield,
  },
  {
    name: 'Provider Partnership',
    description: 'We work alongside healthcare providers to understand their challenges. Our product roadmap is shaped by real-world feedback from practices of all sizes.',
    icon: Users,
  },
  {
    name: 'Continuous Innovation',
    description: 'Healthcare is evolving, and so are we. We invest heavily in R&D to bring cutting-edge AI and automation capabilities to every practice.',
    icon: Target,
  },
]

const team = [
  {
    name: 'Dr. Erol Akarsu',
    role: 'Founder & CEO',
    bio: 'Physician and technologist with a passion for transforming healthcare delivery through innovative software solutions.',
  },
]

const milestones = [
  { year: '2023', event: 'Founded by Dr. Erol Akarsu' },
  { year: '2024', event: 'Platform development and beta launch' },
  { year: '2025', event: 'Full platform release with AI features' },
]

const stats = [
  { value: '5,000+', label: 'Healthcare Providers' },
  { value: '2M+', label: 'Patients Served' },
  { value: '99.9%', label: 'Uptime' },
  { value: '98%', label: 'Customer Satisfaction' },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Our Mission: Transform Healthcare Delivery
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We believe every healthcare provider deserves powerful, intuitive tools that let them focus on what matters most: caring for patients. PracticeFlux was built by clinicians, for clinicians.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-gray-600">
                <p>
                  PracticeFlux was born out of firsthand experience with the challenges healthcare providers face daily. Dr. Erol Akarsu witnessed how clunky EHRs, disconnected billing systems, and endless administrative burden were taking physicians away from what matters most: patient care.
                </p>
                <p>
                  The vision was clear: build a unified platform that actually works the way healthcare providers think, powered by AI to handle the tedious tasks and let clinicians focus on medicine.
                </p>
                <p>
                  Today, PracticeFlux is designed to give every practice, from solo physicians to large medical groups, access to enterprise-grade tools that improve care and reduce burnout.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8 lg:p-12">
              <blockquote className="text-white">
                <p className="text-xl font-medium leading-8">
                  &quot;I built PracticeFlux so no provider has to choose between efficient documentation and meaningful patient interactions.&quot;
                </p>
                <footer className="mt-6">
                  <p className="font-semibold">Dr. Erol Akarsu</p>
                  <p className="text-teal-200 text-sm">Founder & CEO</p>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {values.map((value) => (
                <div key={value.name} className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <value.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.name}</h3>
                  <p className="mt-2 text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Team */}
      <section id="careers" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Leadership
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-md">
            {team.map((person) => (
              <div key={person.name} className="text-center">
                <div className="mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-teal-200 to-cyan-200 flex items-center justify-center">
                  <span className="text-4xl font-bold text-teal-700">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{person.name}</h3>
                <p className="text-sm text-teal-600">{person.role}</p>
                <p className="mt-3 text-gray-600">{person.bio}</p>
                <div className="mt-4 flex justify-center gap-4">
                  <a href="#" className="text-gray-400 hover:text-teal-600">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-teal-600">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Key milestones in the PracticeFlux story
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-teal-200" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8 order-last'}`}>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <span className="text-sm font-bold text-teal-600">{milestone.year}</span>
                        <p className="mt-1 text-sm text-gray-600">{milestone.event}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-teal-600 ring-4 ring-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog placeholder */}
      <section id="blog" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              From Our Blog
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Insights on healthcare technology, practice management, and industry trends
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                { title: 'Maximizing Your MIPS Score in 2025', category: 'Quality', slug: 'maximizing-mips-score-2025' },
                { title: 'How AI is Transforming Clinical Documentation', category: 'Technology', slug: 'ai-transforming-clinical-documentation' },
                { title: 'Reducing Claim Denials: A Practical Guide', category: 'Billing', slug: 'reducing-claim-denials' },
              ].map((post) => (
                <div key={post.title} className="bg-gray-50 rounded-xl p-6">
                  <span className="text-xs font-medium text-teal-600 uppercase">{post.category}</span>
                  <h3 className="mt-2 font-semibold text-gray-900">{post.title}</h3>
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center text-sm text-teal-600 hover:text-teal-700">
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Open Positions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join our mission to transform healthcare delivery
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                title: 'Senior Full-Stack Engineer',
                department: 'Engineering',
                location: 'Remote (US)',
                type: 'Full-time',
              },
              {
                title: 'Product Manager - Clinical Workflows',
                department: 'Product',
                location: 'Remote (US)',
                type: 'Full-time',
              },
              {
                title: 'Healthcare Implementation Specialist',
                department: 'Customer Success',
                location: 'Remote (US)',
                type: 'Full-time',
              },
              {
                title: 'AI/ML Engineer',
                department: 'Engineering',
                location: 'Remote (US)',
                type: 'Full-time',
              },
              {
                title: 'Customer Support Representative',
                department: 'Customer Success',
                location: 'Remote (US)',
                type: 'Full-time',
              },
              {
                title: 'Sales Development Representative',
                department: 'Sales',
                location: 'Remote (US)',
                type: 'Full-time',
              },
            ].map((job) => (
              <Link
                key={job.title}
                href="/contact"
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-teal-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join Our Team
            </h2>
            <p className="mt-6 text-lg leading-8 text-teal-100">
              We&apos;re always looking for talented people who are passionate about improving healthcare. Remote-first, competitive benefits, and meaningful work.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                  Apply Now
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
