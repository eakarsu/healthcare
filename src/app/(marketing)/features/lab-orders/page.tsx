import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle, FlaskConical, TrendingUp, Bell, FileText, Zap } from 'lucide-react'

export default function LabOrdersPage() {
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
              <FlaskConical className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Clinical Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Lab Orders</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Direct lab ordering with bidirectional results integration. Order labs electronically and receive results automatically in the patient chart.
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
              { value: '24hr', label: 'Average Turnaround' },
              { value: '500+', label: 'Lab Tests Available' },
              { value: '100%', label: 'Auto-Import Rate' },
              { value: '3', label: 'Major Lab Partners' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Electronic Lab Ordering */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Electronic Lab Ordering?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Electronic Lab Ordering (ELO)</strong> is a digital system that allows healthcare providers to order laboratory tests electronically and receive results directly into the patient's electronic health record. Instead of paper requisition forms and faxed results, everything flows digitally.
              </p>
              <p>
                Electronic lab ordering offers significant advantages over traditional paper-based processes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eliminates transcription errors:</strong> No more illegible handwriting or data entry mistakes when copying from paper forms.</li>
                <li><strong>Faster turnaround:</strong> Orders are transmitted instantly to the lab, and results return electronically within hours instead of days.</li>
                <li><strong>Automatic patient matching:</strong> Results are automatically linked to the correct patient record - no manual filing required.</li>
                <li><strong>Real-time status tracking:</strong> See when specimens are collected, received at the lab, and when results are pending or complete.</li>
                <li><strong>Critical value alerts:</strong> Immediate notification when panic values are detected, enabling rapid clinical response.</li>
                <li><strong>Historical trending:</strong> Compare current results to past values and graph trends over time for better clinical decision-making.</li>
              </ul>
              <p>
                PracticeFlux integrates with LabCorp, Quest Diagnostics, and local reference laboratories to provide a seamless lab workflow from order to result review.
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
                Complete Lab Workflow Integration
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Direct Lab Connectivity:</strong> PracticeFlux connects directly to major laboratory networks including LabCorp, Quest Diagnostics, and hundreds of regional reference labs. Orders are transmitted electronically with all required patient demographics and insurance information.
                </p>
                <p>
                  <strong>Bidirectional Results Interface:</strong> Results flow back automatically through HL7 interfaces and are matched to the correct patient using advanced matching algorithms. Discrete lab values are parsed and stored individually, enabling trending and clinical decision support.
                </p>
                <p>
                  <strong>Custom Order Sets:</strong> Create order sets for common scenarios like annual physicals, diabetes monitoring, or prenatal panels. One click orders multiple related tests with appropriate diagnosis codes and specimen requirements.
                </p>
                <p>
                  <strong>Result Interpretation Tools:</strong> Add clinical interpretations to results, mark as reviewed, and share with patients through the portal. Flag abnormal results for follow-up and set reminders for repeat testing.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Lab Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hemoglobin A1C</p>
                      <p className="text-xs text-gray-500">12/20/2024</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">6.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">LDL Cholesterol</p>
                      <p className="text-xs text-gray-500">12/20/2024</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">165 mg/dL ↑</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">TSH</p>
                      <p className="text-xs text-gray-500">12/20/2024</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">2.1 mIU/L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'Direct Ordering', description: 'Order labs electronically from LabCorp, Quest, and local labs without paper requisitions.' },
              { icon: CheckCircle, title: 'Auto-Import Results', description: 'Results automatically import into the patient chart with abnormal values flagged.' },
              { icon: TrendingUp, title: 'Result Trending', description: 'Graph lab values over time to visualize trends and track treatment effectiveness.' },
              { icon: Bell, title: 'Critical Alerts', description: 'Immediate notification when critical or panic values are received.' },
              { icon: FileText, title: 'Order Sets', description: 'Create custom order sets for common scenarios like annual physicals or diabetes monitoring.' },
              { icon: FlaskConical, title: 'Specimen Tracking', description: 'Track specimen collection status and see estimated result availability.' },
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
            Ready to Streamline Lab Orders?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join practices with seamless lab integration.
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
