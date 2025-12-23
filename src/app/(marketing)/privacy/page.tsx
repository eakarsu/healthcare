import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
          <p className="mt-4 text-gray-500">Last updated: December 2024</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              PracticeFlux (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and the privacy of your patients. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare practice management platform.
            </p>
            <p className="text-gray-600">
              We comply with the Health Insurance Portability and Accountability Act (HIPAA), the Health Information Technology for Economic and Clinical Health (HITECH) Act, and other applicable privacy laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Name, email address, and phone number</li>
              <li>Practice name and address</li>
              <li>Professional credentials and NPI numbers</li>
              <li>Billing and payment information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Protected Health Information (PHI)</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Patient demographics and contact information</li>
              <li>Medical records and clinical documentation</li>
              <li>Insurance and billing information</li>
              <li>Appointment and scheduling data</li>
              <li>Prescription and medication information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Log data and device information</li>
              <li>Feature usage and interaction patterns</li>
              <li>Performance and error data</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain our healthcare management services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative information and service updates</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Improve and optimize our platform</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Protect Your Information</h2>
            <p className="text-gray-600 mb-4">
              We implement robust security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>256-bit AES encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II certified infrastructure</li>
              <li>Role-based access controls</li>
              <li>Automatic session timeouts (15 minutes)</li>
              <li>Comprehensive audit logging</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, rent, or trade your personal information or PHI. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>With your consent:</strong> When you explicitly authorize disclosure</li>
              <li><strong>Service providers:</strong> With vendors who assist in providing our services, bound by strict confidentiality agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Account information: Duration of account plus 7 years</li>
              <li>Medical records: As required by state and federal law (typically 7-10 years)</li>
              <li>Billing records: 7 years per IRS requirements</li>
              <li>Audit logs: 6 years per HIPAA requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Request an accounting of disclosures of PHI</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use essential cookies to maintain your session and provide core functionality. We do not use third-party advertising cookies. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy periodically. We will notify you of material changes via email or through the platform. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">
                <strong>PracticeFlux Privacy Office</strong><br />
                Email: privacy@practiceflux.com<br />
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
