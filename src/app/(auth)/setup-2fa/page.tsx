'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Shield, Smartphone, Key, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Setup2FAPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (step === 1) {
      generateSecret()
    }
  }, [])

  const generateSecret = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate 2FA secret',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, secret }),
      })
      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
        setStep(3)
        await update() // Refresh session
      } else {
        toast({
          title: 'Verification failed',
          description: data.error || 'Invalid verification code',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify code',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const content = `Healthcare Practice AI - Backup Codes\n\nStore these codes in a safe place. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'healthcare-ai-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const finishSetup = () => {
    toast({
      title: '2FA Enabled',
      description: 'Two-factor authentication is now active on your account',
    })
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm">Scan</span>
            </div>
            <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm">Verify</span>
            </div>
            <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-teal-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm">Backup</span>
            </div>
          </div>

          {/* Step 1: Scan QR Code */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              {qrCode ? (
                <div className="flex justify-center">
                  <div className="p-4 bg-white border rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Can&apos;t scan? Enter this code manually:</p>
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border block text-center break-all">
                  {secret || 'Loading...'}
                </code>
              </div>

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                onClick={() => setStep(2)}
                disabled={!secret}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Key className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="text-sm font-mono bg-white px-3 py-2 rounded border text-center"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
                  Download Codes
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={finishSetup}
                >
                  Finish Setup
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Each backup code can only be used once. Generate new codes if you run out.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
