'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Turn {
  role: 'user' | 'assistant'
  text: string
  urgent?: boolean
  topics?: string[]
  suggestedActions?: string[]
}

export default function PortalChatPage() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      text:
        'Hi! I am your HIPAA-compliant patient assistant. I can answer questions about your record, recent visits, medications, and prepare you for appointments. For emergencies, please call 911.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  // In a real portal the patientId would come from the authenticated portal session.
  // For demo purposes the field is editable so a tester can paste a Patient.id.
  async function send() {
    if (!input.trim() || loading) return
    if (!patientId.trim()) {
      setError('Please paste your Patient ID first.')
      return
    }
    setError(null)
    const userTurn: Turn = { role: 'user', text: input.trim() }
    setTurns((t) => [...t, userTurn])
    setInput('')
    setLoading(true)
    try {
      const r = await fetch('/api/ai/patient-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientId.trim(), message: userTurn.text }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.message || j.error || `HTTP ${r.status}`)
      setTurns((t) => [
        ...t,
        {
          role: 'assistant',
          text: j.reply || '(no reply)',
          urgent: !!j.urgent,
          topics: j.topics || [],
          suggestedActions: j.suggestedActions || [],
        },
      ])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold">HIPAA-Compliant AI Assistant</h1>
      </div>

      <div className="rounded-lg border bg-yellow-50 p-3 text-sm text-yellow-800 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          This assistant is for non-emergency questions only. For chest pain, difficulty
          breathing, suicidal thoughts, or other emergencies, call 911 immediately.
        </span>
      </div>

      <div className="rounded-lg border p-2 text-sm">
        <label className="block text-xs text-gray-500 mb-1">Patient ID (demo)</label>
        <input
          className="w-full rounded border px-2 py-1"
          placeholder="paste a Patient.id from your record"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
      </div>

      <div
        ref={scrollRef}
        className="h-[60vh] overflow-y-auto rounded-lg border p-4 space-y-3 bg-white"
      >
        {turns.map((t, i) => (
          <div key={i} className={t.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                t.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : t.urgent
                  ? 'bg-red-50 border border-red-300 text-red-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{t.text}</p>
              {t.urgent && (
                <p className="mt-2 text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent — please call your provider or 911 now.
                </p>
              )}
              {t.suggestedActions && t.suggestedActions.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs opacity-80">
                  {t.suggestedActions.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block bg-gray-100 rounded-lg px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin inline" /> thinking...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about medications, follow-ups, or appointment prep..."
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4 mr-1" /> Send
        </Button>
      </div>
    </div>
  )
}
