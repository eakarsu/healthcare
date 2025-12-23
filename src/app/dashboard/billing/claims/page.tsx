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
import { FileText, Plus, Search, Filter, Calendar, DollarSign, Building2, User } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Claim {
  id: string
  claimNumber: string
  status: string
  totalCharge: number
  totalPaid: number
  totalAdjustment: number
  balance: number
  serviceDate: string
  submittedDate: string | null
  patient: { firstName: string; lastName: string; mrn: string }
  insurancePlan: { name: string; payerName: string } | null
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [page, statusFilter])

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/claims?${params}`)
      if (response.ok) {
        const data = await response.json()
        // API returns { claims: [...], total, page, limit, totalPages }
        const claimsList = data.claims || []
        setClaims(claimsList.map((c: {
          id: string
          claimNumber: string
          status: string
          totalCharges: number
          paidAmount: number
          adjustmentAmount: number
          serviceDate: string
          submittedDate: string | null
          patient: { firstName: string; lastName: string; mrn: string }
          insurancePlan: { name: string; payerName: string } | null
        }) => ({
          id: c.id,
          claimNumber: c.claimNumber,
          status: c.status,
          totalCharge: Number(c.totalCharges) || 0,
          totalPaid: Number(c.paidAmount) || 0,
          totalAdjustment: Number(c.adjustmentAmount) || 0,
          balance: (Number(c.totalCharges) || 0) - (Number(c.paidAmount) || 0) - (Number(c.adjustmentAmount) || 0),
          serviceDate: c.serviceDate,
          submittedDate: c.submittedDate,
          patient: c.patient,
          insurancePlan: c.insurancePlan,
        })))
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchClaims()
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
      VOID: 'bg-slate-100 text-slate-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
          <p className="text-gray-500">Manage and track insurance claims</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
          <Link href="/dashboard/billing/claims/new">
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by claim number, patient name, or MRN..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CREATED">Created</SelectItem>
                <SelectItem value="VALIDATED">Validated</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="DENIED">Denied</SelectItem>
                <SelectItem value="APPEALED">Appealed</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : claims.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-300" />
              <p>No claims found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead className="text-right">Charges</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
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
                      <TableCell>{formatDate(claim.serviceDate)}</TableCell>
                      <TableCell>
                        {claim.insurancePlan ? (
                          <div>
                            <p>{claim.insurancePlan.payerName}</p>
                            <p className="text-sm text-gray-500">{claim.insurancePlan.name}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Self-Pay</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(claim.totalCharge)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(claim.totalPaid)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(claim.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/billing/claims/${claim.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Claim #{selectedClaim?.claimNumber}</DialogTitle>
                <DialogDescription>Claim details and financial summary</DialogDescription>
              </div>
              {selectedClaim && (
                <Badge className={getStatusColor(selectedClaim.status)}>{selectedClaim.status}</Badge>
              )}
            </div>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Patient</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedClaim.patient.firstName} {selectedClaim.patient.lastName}</p>
                    <p className="text-sm text-gray-500">MRN: {selectedClaim.patient.mrn}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Service Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{formatDate(selectedClaim.serviceDate)}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Submitted Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{selectedClaim.submittedDate ? formatDate(selectedClaim.submittedDate) : 'Not submitted'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Insurance</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {selectedClaim.insurancePlan ? (
                    <div>
                      <p className="font-medium">{selectedClaim.insurancePlan.payerName}</p>
                      <p className="text-sm text-gray-500">{selectedClaim.insurancePlan.name}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Self-Pay</p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Financial Summary</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Charges</p>
                      <p className="font-medium">{formatCurrency(selectedClaim.totalCharge)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedClaim.totalPaid)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Adjustments</p>
                      <p className="font-medium">{formatCurrency(selectedClaim.totalAdjustment)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="font-medium text-orange-600">{formatCurrency(selectedClaim.balance)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
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
