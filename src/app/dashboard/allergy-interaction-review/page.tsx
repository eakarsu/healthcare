"use client";

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Data = {
  summary: Record<string, number>;
  conflicts: Array<{ patient: string; allergy: string; order: string; severity: string; action: string }>;
  checks: string[];
};

export default function AllergyInteractionReviewPage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/allergy-interaction-review')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) return <div>Loading allergy interaction review...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Allergy Interaction Review</h1>
        <p className="text-gray-600">Screen medications, procedures, supplies, and chart gaps against patient allergy histories.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(data.summary).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2"><CardDescription className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-teal-700">{value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Conflict Queue</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.conflicts.map((item) => (
            <div key={`${item.patient}-${item.order}`} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{item.patient}</div>
                <Badge variant={item.severity === 'critical' ? 'destructive' : 'secondary'}>{item.severity}</Badge>
              </div>
              <div className="text-sm text-gray-600">{item.allergy} against {item.order}</div>
              <div className="text-sm text-teal-700">{item.action}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Review Checks</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-600">{data.checks.join(' -> ')}</p></CardContent>
      </Card>
    </div>
  )
}
