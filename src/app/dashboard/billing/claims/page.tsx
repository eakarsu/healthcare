'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { TableSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Plus, Search, Filter, Calendar, DollarSign, Building2, User, Trash2, Edit, RefreshCw } from 'lucide-react'
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
  const router = useRouter()
  const { toast } = useToast()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Single delete
  const [deleteTarget, setDeleteTarget] = useState<Claim | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/claims?${params}`)
      if (response.ok) {
        const data = await response.json()
        const claimsList = data.claims || []
        setClaims(claimsList.map((c: {
          id: string; claimNumber: string; status: string; totalCharges: number;
          paidAmount: number; adjustmentAmount: number; serviceDate: string;
          submittedDate: string | null; patient: { firstName: string; lastName: string; mrn: string };
          insurancePlan: { name: string; payerName: string } | null
        }) => ({
          id: c.id, claimNumber: c.claimNumber, status: c.status,
          totalCharge: Number(c.totalCharges) || 0, totalPaid: Number(c.paidAmount) || 0,
          totalAdjustment: Number(c.adjustmentAmount) || 0,
          balance: (Number(c.totalCharges) || 0) - (Number(c.paidAmount) || 0) - (Number(c.adjustmentAmount) || 0),
          serviceDate: c.serviceDate, submittedDate: c.submittedDate,
          patient: c.patient, insurancePlan: c.insurancePlan,
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

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === claims.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(claims.map(c => c.id)))
  }

  const handleBulkDelete = async () => {
    setBulkLoading(true)
    try {
      const response = await fetch('/api/claims/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        fetchClaims()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to void claims', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkDeleteOpen(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkUpdateStatus) return
    setBulkLoading(true)
    try {
      const response = await fetch('/api/claims/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        setBulkUpdateStatus('')
        fetchClaims()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update claims', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkUpdateOpen(false)
    }
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const response = await fetch('/api/claims/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [deleteTarget.id] }),
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Claim voided successfully' })
        setDeleteTarget(null)
        setSelectedClaim(null)
        fetchClaims()
      } else {
        const data = await response.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to void claim', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CREATED: 'bg-gray-100 text-gray-800', VALIDATED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-indigo-100 text-indigo-800', ACKNOWLEDGED: 'bg-cyan-100 text-cyan-800',
      PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-lime-100 text-lime-800', DENIED: 'bg-red-100 text-red-800',
      APPEALED: 'bg-orange-100 text-orange-800', VOID: 'bg-slate-100 text-slate-800',
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
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
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

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-teal-50 border border-teal-200 p-3">
              <span className="text-sm font-medium text-teal-800">
                {selectedIds.size} claim{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setBulkUpdateOpen(true)}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Bulk Update
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Void Selected
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} columns={9} />
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
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === claims.length && claims.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead className="text-right">Charges</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow
                      key={claim.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(claim.id)}
                          onCheckedChange={() => toggleSelect(claim.id)}
                        />
                      </TableCell>
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
                      <TableCell className="text-right font-medium">{formatCurrency(claim.balance)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Dialog with Edit/Delete */}
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

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteTarget(selectedClaim)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Void
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.push(`/dashboard/billing/claims/${selectedClaim.id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                    <Link href={`/dashboard/billing/claims/${selectedClaim.id}`}>
                      View Full Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Void Selected Claims"
        description={`Are you sure you want to void ${selectedIds.size} claim${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Void All"
        variant="danger"
        loading={bulkLoading}
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update Claims</DialogTitle>
            <DialogDescription>
              Update status for {selectedIds.size} selected claim{selectedIds.size > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPEALED">Appealed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkUpdateOpen(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleBulkUpdate} disabled={!bulkUpdateStatus || bulkLoading}>
                {bulkLoading ? 'Updating...' : 'Update All'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Void Claim"
        description={`Are you sure you want to void claim #${deleteTarget?.claimNumber}?`}
        confirmLabel="Void"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleSingleDelete}
      />
    </div>
  )
}
