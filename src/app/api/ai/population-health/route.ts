// Population-health stratification + outreach orchestration.
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Tier = 'low' | 'moderate' | 'high' | 'rising'

function stratify(p: any): Tier {
  const age = p.age || 40
  const conditions: string[] = (p.conditions || []).map((c: any) => String(c).toLowerCase())
  const heavyConds = ['diabetes', 'chf', 'copd', 'esrd', 'cancer']
  const heavyCount = conditions.filter(c => heavyConds.some(h => c.includes(h))).length
  if (heavyCount >= 2 || age >= 75) return 'high'
  if (heavyCount === 1) return 'moderate'
  if ((p.recentEdVisits || 0) >= 2) return 'rising'
  return 'low'
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { action } = body

  if (action === 'stratify') {
    let cohort: any[] = body.cohort
    if (!cohort) {
      try { cohort = await (prisma as any).patient.findMany({ take: 500 }) } catch { cohort = [] }
    }
    const tiered: Record<Tier, any[]> = { low: [], moderate: [], high: [], rising: [] }
    for (const p of cohort) {
      tiered[stratify(p)].push({ id: p.id, name: p.firstName || p.name, age: p.age })
    }
    return NextResponse.json({
      counts: Object.fromEntries(Object.entries(tiered).map(([k, v]) => [k, v.length])),
      sample: Object.fromEntries(Object.entries(tiered).map(([k, v]) => [k, v.slice(0, 5)]))
    })
  }

  if (action === 'outreach') {
    const { tier, campaignTemplate } = body
    if (!tier || !campaignTemplate) return NextResponse.json({ error: 'tier and campaignTemplate required' }, { status: 400 })
    let cohort: any[] = []
    try { cohort = await (prisma as any).patient.findMany({ take: 500 }) } catch {}
    const targets = cohort.filter(p => stratify(p) === tier)
    return NextResponse.json({ tier, queued: targets.length, template: campaignTemplate, note: 'Wire to messaging service to send' })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
