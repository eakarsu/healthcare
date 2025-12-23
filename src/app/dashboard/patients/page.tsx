'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
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
                      <TableCell>
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="font-medium hover:text-teal-600"
                        >
                          {patient.lastName}, {patient.firstName}
                        </Link>
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

      {/* Patient Detail Dialog */}
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

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800" asChild>
                  <Link href={`/dashboard/patients/${selectedPatient.id}`}>
                    View Full Chart
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
