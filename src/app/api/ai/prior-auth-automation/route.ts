// Automated prior-auth submission and status polling.
// TODO: configure credentials — CHANGE_HEALTHCARE_CLIENT_ID/SECRET or payer-specific portal creds.
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

type Submission = {
  id: string
  patientId: string
  cptCodes: string[]
  payerId: string
  diagnosis: string
  status: 'submitted' | 'in_review' | 'approved' | 'denied'
  submittedAt: Date
  responses: any[]
}
const submissions = new Map<string, Submission>()

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { action } = body

  if (action === 'submit') {
    const { patientId, cptCodes, payerId, diagnosis } = body
    if (!patientId || !cptCodes || !payerId) return NextResponse.json({ error: 'patientId, cptCodes, payerId required' }, { status: 400 })
    const id = `pa_${Date.now()}`
    submissions.set(id, { id, patientId, cptCodes, payerId, diagnosis, status: 'submitted', submittedAt: new Date(), responses: [] })
    return NextResponse.json({ submission: submissions.get(id), note: process.env.CHANGE_HEALTHCARE_CLIENT_ID ? 'Live mode' : 'Mock — credentials not configured' })
  }

  if (action === 'poll') {
    const s = submissions.get(body.id)
    if (!s) return NextResponse.json({ error: 'submission not found' }, { status: 404 })
    // Simulated state progression for the v0.
    if (s.status === 'submitted') s.status = 'in_review'
    else if (s.status === 'in_review') s.status = Math.random() > 0.2 ? 'approved' : 'denied'
    s.responses.push({ at: new Date(), status: s.status })
    return NextResponse.json(s)
  }

  if (action === 'appeal') {
    const s = submissions.get(body.id)
    if (!s) return NextResponse.json({ error: 'submission not found' }, { status: 404 })
    if (s.status !== 'denied') return NextResponse.json({ error: 'only denied submissions can be appealed' }, { status: 400 })
    s.status = 'in_review'
    s.responses.push({ at: new Date(), event: 'appeal_filed', reason: body.reason })
    return NextResponse.json(s)
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ count: submissions.size, submissions: [...submissions.values()] })
}
