'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Mail className="h-8 w-8 text-teal-600 animate-pulse" />
              </div>
              <CardTitle>Verifying your email...</CardTitle>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Email Verified</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-600">{message}</p>
          {status === 'verifying' && (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          )}
          {status !== 'verifying' && (
            <Button className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link href={status === 'success' ? '/dashboard' : '/login'}>
                {status === 'success' ? 'Go to Dashboard' : 'Back to Login'}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
