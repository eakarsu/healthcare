'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, Mic, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Governed clinical drafting</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          The medical-scribe workflow is the only supported AI-assisted clinical operation. It creates an unsigned draft with source provenance and deterministic safety flags; a separate clinician must resolve every blocker and attest before signing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Mic className="h-5 w-5" />
          </div>
          <CardTitle>Medical scribe draft</CardTitle>
          <CardDescription>Consent-gated, practice-scoped, provenance-recorded, and never auto-signed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-teal-700" />Patient, encounter, and active treatment consent are verified before provider use.</li>
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Allergy, medication, critical-vital, and missing-handoff blockers force escalation.</li>
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-teal-700" />Provider failure creates no fabricated fallback; review and signature are audited separately.</li>
          </ul>
          <Button asChild className="bg-teal-700 hover:bg-teal-800">
            <Link href="/dashboard/ai/scribe">Open governed scribe <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-600">
        Other experimental AI and generated gap routes have been removed. Source code and deployment controls do not by themselves certify regulatory compliance; follow the security and clinical-operations launch gates.
      </p>
    </div>
  )
}
