'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Shield,
  Trash2,
  Edit,
  RefreshCw,
} from 'lucide-react'
import { formatDate, formatPhone, calculateAge, getStatusColor } from '@/lib/utils'

interface Patient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  email: string | null
  status: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  insurances: Array<{
    insurancePlan: {
      name: string
      payerName: string
    }
    memberId?: string
  }>
}

export default function PatientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Single delete
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [page, search, statusFilter])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/patients?${params}`)
      const data = await response.json()
      setPatients(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === patients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(patients.map((p) => p.id)))
    }
  }

  const handleBulkDelete = async () => {
    setBulkLoading(true)
    try {
      const response = await fetch('/api/patients/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        fetchPatients()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete patients', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkDeleteOpen(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkUpdateStatus) return
    setBulkLoading(true)
    try {
      const response = await fetch('/api/patients/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: data.message })
        setSelectedIds(new Set())
        setBulkUpdateStatus('')
        fetchPatients()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update patients', variant: 'destructive' })
    } finally {
      setBulkLoading(false)
      setBulkUpdateOpen(false)
    }
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/patients/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Patient deactivated successfully' })
        setDeleteTarget(null)
        setSelectedPatient(null)
        fetchPatients()
      } else {
        const data = await response.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete patient', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage patient records and information</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
          <Link href="/dashboard/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, MRN, or phone..."
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DECEASED">Deceased</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-teal-50 border border-teal-200 p-3">
              <span className="text-sm font-medium text-teal-800">
                {selectedIds.size} patient{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkUpdateOpen(true)}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Bulk Update
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Bulk Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} columns={7} />
          ) : patients.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <p>No patients found</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/patients/new">Add your first patient</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === patients.length && patients.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>MRN</TableHead>
                    <TableHead>DOB / Age</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(patient.id)}
                          onCheckedChange={() => toggleSelect(patient.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium hover:text-teal-600">
                          {patient.lastName}, {patient.firstName}
                        </span>
                        <p className="text-sm text-gray-500 capitalize">
                          {patient.gender.toLowerCase()}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {patient.mrn}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(patient.dateOfBirth)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {calculateAge(patient.dateOfBirth)} years old
                        </p>
                      </TableCell>
                      <TableCell>
                        {patient.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {formatPhone(patient.phone)}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {patient.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.insurances[0] ? (
                          <span className="text-sm">
                            {patient.insurances[0].insurancePlan.payerName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Self-Pay</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/patients/${patient.id}`}>View</Link>
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Dialog with Edit/Delete */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <User className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <DialogTitle>
                  {selectedPatient?.firstName} {selectedPatient?.lastName}
                </DialogTitle>
                <DialogDescription>MRN: {selectedPatient?.mrn}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</p>
                  <p className="text-sm text-gray-500">{calculateAge(selectedPatient.dateOfBirth)} years old</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedPatient.gender.toLowerCase()}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Contact Information</p>
                {selectedPatient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {formatPhone(selectedPatient.phone)}
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedPatient.email}
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedPatient.address}, {selectedPatient.city}, {selectedPatient.state} {selectedPatient.zipCode}
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Insurance</p>
                {selectedPatient.insurances[0] ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{selectedPatient.insurances[0].insurancePlan.payerName}</p>
                      <p className="text-gray-500">{selectedPatient.insurances[0].insurancePlan.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Self-Pay</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedPatient.status)}>
                  {selectedPatient.status}
                </Badge>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteTarget(selectedPatient)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/patients/${selectedPatient.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                    <Link href={`/dashboard/patients/${selectedPatient.id}`}>
                      View Full Chart
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
        title="Delete Selected Patients"
        description={`Are you sure you want to deactivate ${selectedIds.size} patient${selectedIds.size > 1 ? 's' : ''}? This action will set their status to inactive.`}
        confirmLabel="Delete All"
        variant="danger"
        loading={bulkLoading}
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update Patients</DialogTitle>
            <DialogDescription>
              Update status for {selectedIds.size} selected patient{selectedIds.size > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkUpdateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleBulkUpdate}
                disabled={!bulkUpdateStatus || bulkLoading}
              >
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
        title="Delete Patient"
        description={`Are you sure you want to deactivate ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This will set their status to inactive.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleSingleDelete}
      />
    </div>
  )
}
