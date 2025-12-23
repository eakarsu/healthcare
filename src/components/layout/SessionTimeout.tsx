'use client'

import { useEffect, useState, useCallback } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const TIMEOUT_WARNING = 13 * 60 * 1000 // 13 minutes - show warning
const TIMEOUT_LOGOUT = 15 * 60 * 1000 // 15 minutes - auto logout
const CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds

export function SessionTimeout() {
  const { data: session, update } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
    setShowWarning(false)
  }, [])

  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  const extendSession = async () => {
    resetTimer()
    // Refresh the session
    await update()
  }

  useEffect(() => {
    if (!session) return

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [session, handleActivity])

  useEffect(() => {
    if (!session) return

    const checkTimeout = () => {
      const elapsed = Date.now() - lastActivity

      if (elapsed >= TIMEOUT_LOGOUT) {
        signOut({ callbackUrl: '/login?timeout=true' })
      } else if (elapsed >= TIMEOUT_WARNING) {
        setShowWarning(true)
      }
    }

    const interval = setInterval(checkTimeout, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [session, lastActivity])

  if (!session) return null

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. For security purposes and HIPAA compliance,
            you will be logged out automatically in 2 minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
            Log Out Now
          </Button>
          <Button onClick={extendSession}>
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
