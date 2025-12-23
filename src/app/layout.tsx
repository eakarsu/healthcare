import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://practiceflux.com'),
  title: {
    default: 'PracticeFlux - Healthcare Practice Management Software',
    template: '%s | PracticeFlux',
  },
  description: 'HIPAA-compliant healthcare practice management system with EHR, billing, AI-powered documentation, and quality reporting. Trusted by thousands of healthcare providers.',
  keywords: [
    'healthcare practice management',
    'EHR software',
    'electronic health records',
    'medical billing software',
    'HIPAA compliant',
    'e-prescribing',
    'MIPS reporting',
    'clinical documentation',
    'AI medical scribe',
    'revenue cycle management',
  ],
  authors: [{ name: 'PracticeFlux' }],
  creator: 'PracticeFlux',
  publisher: 'PracticeFlux',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://practiceflux.com',
    siteName: 'PracticeFlux',
    title: 'PracticeFlux - Healthcare Practice Management Software',
    description: 'HIPAA-compliant healthcare practice management system with EHR, billing, AI-powered documentation, and quality reporting.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PracticeFlux - Healthcare Practice Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PracticeFlux - Healthcare Practice Management Software',
    description: 'HIPAA-compliant healthcare practice management system with EHR, billing, AI-powered documentation, and quality reporting.',
    images: ['/og-image.png'],
    creator: '@practiceflux',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://practiceflux.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
