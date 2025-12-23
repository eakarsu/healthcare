'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertTriangle,
  Search,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  RefreshCw,
  ArrowLeft,
  Send,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DeniedClaim {
  id: string
  claimNumber: string
  status: string
  totalCharge: number
  denialReason: string | null
  serviceDate: string
  submittedDate: string | null
  patient: { firstName: string; lastName: string; mrn: string }
  insurancePlan: { name: string; payerName: string } | null
}

export default function DenialsPage() {
  const [claims, setClaims] = useState<DeniedClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<DeniedClaim | null>(null)
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [appealNotes, setAppealNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDeniedClaims()
  }, [])

  const fetchDeniedClaims = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/claims?status=DENIED&limit=100')
      if (response.ok) {
        const data = await response.json()
        const claimsList = data.claims || []
        setClaims(claimsList.map((c: {
          id: string
          claimNumber: string
          status: string
          totalCharges: number
          denialReason: string | null
          serviceDate: string
          submittedDate: string | null
          patient: { firstName: string; lastName: string; mrn: string }
          insurancePlan: { name: string; payerName: string } | null
        }) => ({
          id: c.id,
          claimNumber: c.claimNumber,
          status: c.status,
          totalCharge: Number(c.totalCharges) || 0,
          denialReason: c.denialReason,
          serviceDate: c.serviceDate,
          submittedDate: c.submittedDate,
          patient: c.patient,
          insurancePlan: c.insurancePlan,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch denied claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppeal = async () => {
    if (!selectedClaim) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPEALED',
          notes: appealNotes,
        }),
      })

      if (response.ok) {
        // Remove from list or update status
        setClaims(prev => prev.filter(c => c.id !== selectedClaim.id))
        setAppealDialogOpen(false)
        setSelectedClaim(null)
        setAppealNotes('')
      }
    } catch (error) {
      console.error('Failed to submit appeal:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredClaims = claims.filter(claim => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      claim.claimNumber.toLowerCase().includes(searchLower) ||
      claim.patient.firstName.toLowerCase().includes(searchLower) ||
      claim.patient.lastName.toLowerCase().includes(searchLower) ||
      claim.patient.mrn.toLowerCase().includes(searchLower)
    )
  })

  const totalDeniedAmount = claims.reduce((sum, c) => sum + c.totalCharge, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/billing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Denied Claims</h1>
            <p className="text-gray-500">Review and appeal denied claims</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchDeniedClaims}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Denied</p>
                <p className="text-2xl font-bold text-red-600">{claims.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Denied Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDeniedAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg per Claim</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(claims.length ? totalDeniedAmount / claims.length : 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Denied Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by claim #, patient name, or MRN..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Denied Claims</p>
              <p className="text-sm">All claims are in good standing</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Denial Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/billing/claims/${claim.id}`}
                        className="font-medium text-teal-600 hover:underline"
                      >
                        {claim.claimNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {claim.patient.lastName}, {claim.patient.firstName}
                        </p>
                        <p className="text-sm text-gray-500">{claim.patient.mrn}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.insurancePlan ? (
                        <div>
                          <p className="font-medium">{claim.insurancePlan.payerName}</p>
                          <p className="text-sm text-gray-500">{claim.insurancePlan.name}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Self-Pay</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(claim.serviceDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(claim.totalCharge)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-red-600">
                        {claim.denialReason || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/dashboard/billing/claims/${claim.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => {
                            setSelectedClaim(claim)
                            setAppealDialogOpen(true)
                          }}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Appeal
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Appeal Dialog */}
      <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-teal-600" />
              Appeal Claim
            </DialogTitle>
            <DialogDescription>
              Submit an appeal for claim #{selectedClaim?.claimNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium text-sm">
                      {selectedClaim.patient.firstName} {selectedClaim.patient.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium text-sm">
                      {formatCurrency(selectedClaim.totalCharge)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Insurance</p>
                    <p className="font-medium text-sm">
                      {selectedClaim.insurancePlan?.payerName || 'Self-Pay'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Service Date</p>
                    <p className="font-medium text-sm">
                      {formatDate(selectedClaim.serviceDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Denial Reason</p>
                <p className="text-sm text-red-700">
                  {selectedClaim.denialReason || 'Not specified'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appealNotes">Appeal Notes</Label>
                <Textarea
                  id="appealNotes"
                  placeholder="Provide additional information to support the appeal..."
                  rows={4}
                  value={appealNotes}
                  onChange={(e) => setAppealNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAppealDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleAppeal}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Appeal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
