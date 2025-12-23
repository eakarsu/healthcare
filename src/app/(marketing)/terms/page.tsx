import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Terms of Service</h1>
          <p className="mt-4 text-gray-500">Last updated: December 2024</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using PracticeFlux (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
            <p className="text-gray-600">
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              PracticeFlux is a cloud-based healthcare practice management platform that provides:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Electronic Health Records (EHR) management</li>
              <li>Practice scheduling and appointment management</li>
              <li>Medical billing and revenue cycle management</li>
              <li>AI-powered clinical decision support</li>
              <li>Quality measure tracking and reporting</li>
              <li>Patient portal and engagement tools</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 mb-4">To use the Service, you must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years old or have legal authority to enter contracts</li>
              <li>Be a licensed healthcare provider or authorized representative of a healthcare organization</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree to use the Service only for lawful purposes. You shall not:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations, including HIPAA</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or interfere with the Service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use the Service to store or transmit unlawful content</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service for any purpose other than healthcare practice management</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. HIPAA Compliance</h2>
            <p className="text-gray-600 mb-4">
              PracticeFlux is designed to be HIPAA-compliant. We will:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Execute a Business Associate Agreement (BAA) with all customers</li>
              <li>Implement required administrative, physical, and technical safeguards</li>
              <li>Report any security incidents as required by law</li>
              <li>Ensure our subcontractors comply with HIPAA requirements</li>
            </ul>
            <p className="text-gray-600">
              You are responsible for ensuring your use of the Service complies with HIPAA and other applicable healthcare regulations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fees and Payment</h2>
            <p className="text-gray-600 mb-4">
              Subscription fees are billed monthly or annually as selected. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Pay all fees when due</li>
              <li>Provide accurate billing information</li>
              <li>Notify us of any billing disputes within 30 days</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Fees are non-refundable except as required by law or as specified in our refund policy. We may change fees with 30 days notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Ownership</h2>
            <p className="text-gray-600 mb-4">
              <strong>Your Data:</strong> You retain all rights to your data, including patient information and practice data. You grant us a limited license to use this data solely to provide and improve the Service.
            </p>
            <p className="text-gray-600">
              <strong>Our Property:</strong> PracticeFlux, including all software, designs, and documentation, remains our exclusive property. These Terms do not grant you any rights to our intellectual property except the limited right to use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-600 mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Perform scheduled maintenance with advance notice</li>
              <li>Make emergency repairs without notice</li>
              <li>Modify or discontinue features with reasonable notice</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 mb-4">
              Either party may terminate the subscription with 30 days written notice. We may suspend or terminate immediately if you:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate these Terms</li>
              <li>Fail to pay fees when due</li>
              <li>Engage in fraudulent or illegal activity</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Upon termination, you may export your data for 90 days. After that period, we will delete your data per our retention policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
            <p className="text-gray-600 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p className="text-gray-600">
              <strong>Medical Disclaimer:</strong> PracticeFlux is a practice management tool, not a medical device. AI suggestions are for informational purposes only and do not replace professional medical judgment. You are solely responsible for all clinical decisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRACTICEFLUX SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages exceeding fees paid in the 12 months preceding the claim</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless PracticeFlux from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of third-party rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              Any disputes shall be resolved through binding arbitration in Richmond, Virginia, under the rules of the American Arbitration Association. You waive the right to participate in class actions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. General Provisions</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Governing Law:</strong> These Terms are governed by California law.</li>
              <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between us.</li>
              <li><strong>Severability:</strong> If any provision is unenforceable, the remaining provisions continue in effect.</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our consent.</li>
              <li><strong>Modifications:</strong> We may modify these Terms with 30 days notice.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">
                <strong>PracticeFlux Legal Department</strong><br />
                Email: legal@practiceflux.com<br />
                Phone: 804-360-1129<br />
                Address: 2807 Hampton Woods Dr, Richmond, VA 23233
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
