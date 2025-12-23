'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BillingStats {
  totalCharges: number
  totalPayments: number
  totalAR: number
  claimsPending: number
  claimsDenied: number
  claimsSubmitted: number
  averageDaysAR: number
  collectionRate: number
}

interface RecentClaim {
  id: string
  claimNumber: string
  status: string
  totalCharge: number
  patient: { firstName: string; lastName: string }
  createdAt: string
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats>({
    totalCharges: 0,
    totalPayments: 0,
    totalAR: 0,
    claimsPending: 0,
    claimsDenied: 0,
    claimsSubmitted: 0,
    averageDaysAR: 0,
    collectionRate: 0,
  })
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<RecentClaim | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const [statsRes, claimsRes] = await Promise.all([
        fetch('/api/billing/stats'),
        fetch('/api/claims?limit=5'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data || statsData)
      }

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        // API returns { data: { claims: [...] } }
        const claims = claimsData.data?.claims || claimsData.claims || []
        setRecentClaims(claims.map((c: { id: string; claimNumber: string; status: string; totalCharges: number; patient: { firstName: string; lastName: string }; createdAt: string }) => ({
          id: c.id,
          claimNumber: c.claimNumber,
          status: c.status,
          totalCharge: Number(c.totalCharges) || 0,
          patient: c.patient,
          createdAt: c.createdAt,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CREATED: 'bg-gray-100 text-gray-800',
      VALIDATED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-indigo-100 text-indigo-800',
      ACKNOWLEDGED: 'bg-cyan-100 text-cyan-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-lime-100 text-lime-800',
      DENIED: 'bg-red-100 text-red-800',
      APPEALED: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500">Revenue cycle management and claims processing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing/eligibility">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verify Eligibility
            </Link>
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
            <Link href="/dashboard/billing/claims/new">
              <FileText className="mr-2 h-4 w-4" />
              New Claim
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total A/R</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAR)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Days in A/R</p>
                <p className="text-2xl font-bold">{stats.averageDaysAR}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Collection Rate</p>
                <p className="text-2xl font-bold">{stats.collectionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Claims Denied</p>
                <p className="text-2xl font-bold text-red-600">{stats.claimsDenied}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/dashboard/billing/claims">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <FileText className="h-10 w-10 text-teal-600 mb-2" />
              <p className="font-medium">Claims</p>
              <p className="text-sm text-gray-500">{stats.claimsSubmitted} pending</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/billing/payments">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <CreditCard className="h-10 w-10 text-teal-600 mb-2" />
              <p className="font-medium">Payments</p>
              <p className="text-sm text-gray-500">Post & view payments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/billing/aging">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Clock className="h-10 w-10 text-teal-600 mb-2" />
              <p className="font-medium">Aging Report</p>
              <p className="text-sm text-gray-500">A/R aging analysis</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/billing/denials">
          <Card className="cursor-pointer hover:border-teal-500 transition-colors h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <AlertTriangle className="h-10 w-10 text-teal-600 mb-2" />
              <p className="font-medium">Denials</p>
              <p className="text-sm text-gray-500">{stats.claimsDenied} to review</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Claims</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/billing/claims">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentClaims.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-500">
              <p>No recent claims</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { setSelectedClaim(claim); setDetailOpen(true) }}
                >
                  <div>
                    <p className="font-medium">{claim.claimNumber}</p>
                    <p className="text-sm text-gray-500">
                      {claim.patient.lastName}, {claim.patient.firstName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{formatCurrency(claim.totalCharge)}</p>
                    <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Claim #{selectedClaim?.claimNumber}
            </DialogTitle>
            <DialogDescription>
              Quick view of claim details
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-500">Status</Label>
                <Badge className={getStatusColor(selectedClaim.status)}>
                  {selectedClaim.status}
                </Badge>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium">
                      {selectedClaim.patient.firstName} {selectedClaim.patient.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-teal-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total Charges</p>
                      <p className="font-medium">{formatCurrency(selectedClaim.totalCharge)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-sm">
                        {new Date(selectedClaim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href={`/dashboard/billing/claims/${selectedClaim.id}`}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
