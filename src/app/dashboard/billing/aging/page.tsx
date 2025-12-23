'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Clock, Download, Filter, DollarSign, Calendar, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface AgingBucket {
  range: string
  count: number
  amount: number
  percentage: number
}

interface AgingClaim {
  id: string
  claimNumber: string
  patient: { firstName: string; lastName: string; mrn: string }
  insurancePlan: { name: string; payerName: string } | null
  serviceDate: string
  balance: number
  daysOld: number
}

interface AgingData {
  buckets: AgingBucket[]
  totalAR: number
  claims: AgingClaim[]
}

export default function AgingReportPage() {
  const [agingData, setAgingData] = useState<AgingData>({
    buckets: [],
    totalAR: 0,
    claims: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedBucket, setSelectedBucket] = useState('all')
  const [payerFilter, setPayerFilter] = useState('all')
  const [selectedClaim, setSelectedClaim] = useState<AgingClaim | null>(null)

  useEffect(() => {
    fetchAgingData()
  }, [selectedBucket, payerFilter])

  const fetchAgingData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedBucket !== 'all') {
        params.append('bucket', selectedBucket)
      }
      if (payerFilter !== 'all') {
        params.append('payer', payerFilter)
      }

      const response = await fetch(`/api/billing/aging?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAgingData(data)
      }
    } catch (error) {
      console.error('Failed to fetch aging data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBucketColor = (range: string) => {
    const colors: Record<string, string> = {
      '0-30': 'bg-green-500',
      '31-60': 'bg-yellow-500',
      '61-90': 'bg-orange-500',
      '91-120': 'bg-red-500',
      '120+': 'bg-red-700',
    }
    return colors[range] || 'bg-gray-500'
  }

  const getDaysOldColor = (days: number) => {
    if (days <= 30) return 'bg-green-100 text-green-800'
    if (days <= 60) return 'bg-yellow-100 text-yellow-800'
    if (days <= 90) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const formatServiceDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/R Aging Report</h1>
          <p className="text-gray-500">Accounts receivable aging analysis</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {agingData.buckets.map((bucket) => (
          <Card
            key={bucket.range}
            className={`cursor-pointer transition-all ${selectedBucket === bucket.range ? 'ring-2 ring-teal-500' : 'hover:border-teal-500'}`}
            onClick={() => setSelectedBucket(selectedBucket === bucket.range ? 'all' : bucket.range)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-block h-3 w-3 rounded-full ${getBucketColor(bucket.range)}`} />
                <span className="text-sm text-gray-500">{bucket.range} days</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(bucket.amount)}</p>
              <p className="text-sm text-gray-500">{bucket.count} claims ({bucket.percentage}%)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total A/R */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-100 p-3">
                <DollarSign className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-teal-700">Total Accounts Receivable</p>
                <p className="text-3xl font-bold text-teal-900">{formatCurrency(agingData.totalAR)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-700">Total Claims</p>
              <p className="text-2xl font-bold text-teal-900">
                {agingData.buckets.reduce((sum, b) => sum + b.count, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {agingData.buckets.map((bucket) => (
              <div
                key={bucket.range}
                className={`${getBucketColor(bucket.range)} transition-all hover:opacity-80`}
                style={{ width: `${bucket.percentage}%` }}
                title={`${bucket.range} days: ${formatCurrency(bucket.amount)} (${bucket.percentage}%)`}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm">
            {agingData.buckets.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-1">
                <span className={`inline-block h-3 w-3 rounded-full ${getBucketColor(bucket.range)}`} />
                <span className="text-gray-600">{bucket.range}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger className="w-40">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-30">0-30 days</SelectItem>
                <SelectItem value="31-60">31-60 days</SelectItem>
                <SelectItem value="61-90">61-90 days</SelectItem>
                <SelectItem value="91-120">91-120 days</SelectItem>
                <SelectItem value="120+">120+ days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={payerFilter} onValueChange={setPayerFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Payer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payers</SelectItem>
                <SelectItem value="medicare">Medicare</SelectItem>
                <SelectItem value="medicaid">Medicaid</SelectItem>
                <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                <SelectItem value="aetna">Aetna</SelectItem>
                <SelectItem value="united">UnitedHealthcare</SelectItem>
                <SelectItem value="selfpay">Self-Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedBucket === 'all' ? 'All Outstanding Claims' : `Claims ${selectedBucket} Days Old`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : agingData.claims.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <DollarSign className="mb-4 h-12 w-12 text-gray-300" />
              <p>No outstanding claims found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Days Old</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.claims.map((claim) => (
                  <TableRow
                    key={claim.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p>{claim.patient.lastName}, {claim.patient.firstName}</p>
                        <p className="text-sm text-gray-500">{claim.patient.mrn}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{claim.insurancePlan?.payerName || 'Self-Pay'}</p>
                        <p className="text-sm text-gray-500">{claim.insurancePlan?.name || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatServiceDate(claim.serviceDate)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getDaysOldColor(claim.daysOld)}`}>
                        {claim.daysOld} days
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(claim.balance)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                        <Link href={`/dashboard/billing/claims/${claim.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Aging Claim Details</DialogTitle>
              {selectedClaim && (
                <Badge className={getDaysOldColor(selectedClaim.daysOld)}>
                  {selectedClaim.daysOld} days old
                </Badge>
              )}
            </div>
            <DialogDescription>Claim #{selectedClaim?.claimNumber}</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Outstanding Balance</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(selectedClaim.balance)}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Patient</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {selectedClaim.patient.firstName} {selectedClaim.patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedClaim.patient.mrn}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Service Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{formatServiceDate(selectedClaim.serviceDate)}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Days Outstanding</p>
                  <p className="font-medium">{selectedClaim.daysOld} days</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Payer</p>
                <p className="font-medium">{selectedClaim.insurancePlan?.payerName || 'Self-Pay'}</p>
                <p className="text-sm text-gray-500">{selectedClaim.insurancePlan?.name || '-'}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                  <Link href={`/dashboard/billing/claims/${selectedClaim.id}`}>
                    View Full Claim
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
