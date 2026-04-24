'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ChangePasswordPage() {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }

    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: 'Success', description: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to change password', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-500">Update your account password</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-teal-100 p-2">
              <Lock className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Password Settings</CardTitle>
              <CardDescription>Choose a strong password with at least 8 characters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {newPassword && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={newPassword.length >= 8 ? 'text-green-700' : 'text-gray-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={/[A-Z]/.test(newPassword) ? 'text-green-700' : 'text-gray-500'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${/\d/.test(newPassword) ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={/\d/.test(newPassword) ? 'text-green-700' : 'text-gray-500'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${newPassword === confirmPassword && confirmPassword ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={newPassword === confirmPassword && confirmPassword ? 'text-green-700' : 'text-gray-500'}>
                    Passwords match
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
