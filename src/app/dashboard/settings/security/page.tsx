'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  Shield,
  Smartphone,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from 'lucide-react'

export default function SecuritySettingsPage() {
  const { toast } = useToast()
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Mock QR code data (in real implementation, this would come from the server)
  const mockSecret = 'ABCDEFGHIJKLMNOP'
  const mockQRCode = `otpauth://totp/HealthcarePracticeAI:admin@practice.com?secret=${mockSecret}&issuer=HealthcarePracticeAI`

  const startSetup = () => {
    setShowSetupDialog(true)
    setSetupStep(1)
    setVerificationCode('')
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In real implementation, verify code with server
    if (verificationCode === '123456') {
      setTwoFAEnabled(true)
      setShowSetupDialog(false)
      toast({
        title: 'Two-factor authentication enabled',
        description: 'Your account is now protected with 2FA.',
      })
    } else {
      toast({
        title: 'Invalid code',
        description: 'The verification code is incorrect. Please try again.',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const disable2FA = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setTwoFAEnabled(false)
    toast({
      title: 'Two-factor authentication disabled',
      description: 'Your account is no longer protected with 2FA.',
    })
    setLoading(false)
  }

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 12) {
      toast({
        title: 'Error',
        description: 'Password must be at least 12 characters',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const signOutAllSessions = async () => {
    if (!confirm('Are you sure you want to sign out all other sessions?')) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Sessions terminated',
        description: 'All other sessions have been signed out.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out sessions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500">Manage your account security and authentication</p>
      </div>

      {/* 2FA Status Card */}
      <Card className={twoFAEnabled ? 'border-green-200' : 'border-yellow-200'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${twoFAEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Shield className={`h-6 w-6 ${twoFAEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
            <Badge className={twoFAEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {twoFAEnabled ? (
                <>
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Enabled
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Not Enabled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication adds an additional layer of security to your account by requiring a
            verification code from your mobile device in addition to your password.
          </p>

          {twoFAEnabled ? (
            <Button variant="outline" onClick={disable2FA} disabled={loading}>
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          ) : (
            <Button onClick={startSetup} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Smartphone className="mr-2 h-4 w-4" />
              Set Up Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2">
              <Key className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Must be at least 12 characters with uppercase, lowercase, number, and special character
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={updatePassword} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-gray-500">Chrome on macOS - Last active now</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          <Button variant="outline" className="mt-4" onClick={signOutAllSessions} disabled={loading}>
            {loading ? 'Signing Out...' : 'Sign Out All Other Sessions'}
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === 1 ? 'Set Up Two-Factor Authentication' : 'Verify Your Device'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 1
                ? 'Scan the QR code with your authenticator app'
                : 'Enter the verification code from your authenticator app'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center">
                {/* QR Code Placeholder */}
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Scan this QR code with Google Authenticator, Authy, or another TOTP app
                </p>
              </div>

              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={mockSecret}
                    readOnly
                    className="font-mono text-center tracking-wider"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(mockSecret)
                      toast({ title: 'Copied to clipboard' })
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep(2)} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSetupStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
