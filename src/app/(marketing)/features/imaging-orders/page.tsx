import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle, Scan, Monitor, FileText, Bell, Building } from 'lucide-react'

export default function ImagingOrdersPage() {
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
              <Scan className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Clinical Feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Imaging Orders</h1>
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl">
            Order X-rays, CT, MRI, and ultrasounds electronically with PACS integration for seamless image viewing directly in the patient chart.
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
              { value: '200+', label: 'Imaging Centers' },
              { value: '100%', label: 'PACS Compatible' },
              { value: '1-Click', label: 'Image Viewing' },
              { value: '24hr', label: 'Report Turnaround' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Electronic Imaging Ordering */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Electronic Imaging Ordering?</h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                <strong>Electronic Imaging Ordering</strong> is a digital system that allows healthcare providers to order diagnostic imaging studies (X-rays, CT scans, MRIs, ultrasounds, etc.) electronically and receive results and actual images directly into the electronic health record through PACS (Picture Archiving and Communication System) integration.
              </p>
              <p>
                Electronic imaging ordering offers significant advantages over traditional paper-based radiology workflows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eliminates paper requisitions:</strong> No more faxing orders or lost paperwork - orders are transmitted instantly to imaging facilities.</li>
                <li><strong>Clinical decision support:</strong> The system suggests appropriate imaging studies based on the clinical indication and checks for prior authorization requirements.</li>
                <li><strong>PACS integration:</strong> View diagnostic-quality images directly in the EHR without launching separate imaging software.</li>
                <li><strong>Automatic report import:</strong> Radiologist interpretations are imported electronically and linked to the original order.</li>
                <li><strong>Critical findings alerts:</strong> Immediate notification when radiologists report unexpected or urgent findings.</li>
                <li><strong>Image comparison:</strong> Compare current studies to prior imaging side-by-side to track disease progression or treatment response.</li>
                <li><strong>Reduced radiation exposure:</strong> Access to imaging history helps avoid unnecessary duplicate studies.</li>
              </ul>
              <p>
                PracticeFlux connects to over 200 imaging centers and hospital radiology departments for seamless diagnostic imaging workflows.
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
                Complete Imaging Workflow Integration
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Multi-Modality Ordering:</strong> Order any type of imaging study from a single interface - X-rays, CT scans, MRIs, ultrasounds, mammograms, nuclear medicine, PET scans, and more. Each modality has appropriate templates with required clinical information.
                </p>
                <p>
                  <strong>Clinical Decision Support:</strong> Based on the clinical indication and patient history, the system suggests appropriate imaging studies and checks ACR Appropriateness Criteria. This helps ensure the right test is ordered the first time.
                </p>
                <p>
                  <strong>Prior Authorization Integration:</strong> The system automatically checks if prior authorization is required based on the patient's insurance and the imaging study ordered. When required, authorization requests can be submitted electronically.
                </p>
                <p>
                  <strong>PACS Viewer Integration:</strong> View full diagnostic-quality images directly within PracticeFlux. Use professional viewing tools including windowing, zoom, pan, and measurement tools. Compare studies over time with synchronized scrolling.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Imaging Study</h3>
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="aspect-square bg-gray-800 rounded flex items-center justify-center">
                    <Scan className="h-16 w-16 text-gray-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Chest X-Ray PA/Lateral</p>
                  <p className="text-xs text-gray-500">Performed: 12/20/2024</p>
                  <div className="p-2 bg-green-50 rounded text-xs text-green-700">
                    Impression: No acute cardiopulmonary abnormality
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
              { icon: Scan, title: 'All Modalities', description: 'Order X-rays, CT, MRI, ultrasound, mammography, and more from a single interface.' },
              { icon: Monitor, title: 'PACS Integration', description: 'View actual images directly in PracticeFlux with full diagnostic-quality viewing tools.' },
              { icon: FileText, title: 'Report Import', description: 'Radiologist reports automatically import and link to orders in the patient chart.' },
              { icon: Bell, title: 'Critical Alerts', description: 'Immediate notification when critical or unexpected findings are reported.' },
              { icon: Building, title: 'Facility Network', description: 'Connected to 200+ imaging centers for convenient patient scheduling.' },
              { icon: CheckCircle, title: 'Prior Auth', description: 'Automatic prior authorization checking with submission support for required studies.' },
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
            Ready for Seamless Imaging?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join practices with integrated imaging workflows.
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
