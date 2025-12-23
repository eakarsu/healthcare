'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  Download,
  Printer,
  Mail,
  Eye,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Superbill {
  id: string
  superbillNumber: string
  patient: { firstName: string; lastName: string }
  provider: { firstName: string; lastName: string; npi: string }
  serviceDate: string
  diagnoses: Array<{ code: string; description: string }>
  procedures: Array<{ code: string; description: string; fee: number; units: number }>
  totalCharges: number
  patientEstimate: number
  amountPaid: number
  printedAt: string | null
  emailedAt: string | null
  createdAt: string
}

interface Encounter {
  id: string
  appointmentId: string
  patient: { firstName: string; lastName: string; dateOfBirth: string }
  appointmentDate: string
  chiefComplaint: string
  hasSuperbill: boolean
}

export default function SuperbillPage() {
  const [superbills, setSuperbills] = useState<Superbill[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSuperbill, setSelectedSuperbill] = useState<Superbill | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [emailing, setEmailing] = useState<string | null>(null)

  useEffect(() => {
    fetchSuperbills()
    fetchRecentEncounters()
  }, [page])

  const fetchSuperbills = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/superbill?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuperbills(data.superbills || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch superbills:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentEncounters = async () => {
    try {
      const response = await fetch('/api/encounters?status=COMPLETED&limit=10')
      if (response.ok) {
        const data = await response.json()
        setEncounters(data.encounters || [])
      }
    } catch (error) {
      console.error('Failed to fetch encounters:', error)
    }
  }

  const createSuperbill = async (encounterId: string) => {
    setCreating(true)
    try {
      const response = await fetch('/api/superbill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounterId }),
      })

      if (response.ok) {
        fetchSuperbills()
        fetchRecentEncounters()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create superbill')
      }
    } catch (error) {
      console.error('Failed to create superbill:', error)
      alert('Failed to create superbill')
    } finally {
      setCreating(false)
    }
  }

  const downloadPDF = async (id: string) => {
    setDownloading(id)
    try {
      const response = await fetch(`/api/superbill/${id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `superbill-${id}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
    } finally {
      setDownloading(null)
    }
  }

  const emailSuperbill = async (id: string) => {
    setEmailing(id)
    try {
      const response = await fetch(`/api/superbill/${id}/email`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchSuperbills()
        alert('Superbill emailed successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to email superbill')
      }
    } catch (error) {
      console.error('Failed to email superbill:', error)
    } finally {
      setEmailing(null)
    }
  }

  const printSuperbill = (id: string) => {
    window.open(`/api/superbill/${id}/pdf?print=true`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Superbills</h1>
          <p className="text-gray-500">Generate walkout statements for patient visits</p>
        </div>
      </div>

      {/* Recent Encounters without Superbill */}
      {encounters.filter(e => !e.hasSuperbill).length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Encounters Needing Superbills
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Recent completed visits without walkout statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {encounters
                .filter(e => !e.hasSuperbill)
                .slice(0, 3)
                .map((encounter) => (
                  <div
                    key={encounter.id}
                    className="p-4 bg-white rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {encounter.patient.lastName}, {encounter.patient.firstName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(encounter.appointmentDate)}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {encounter.chiefComplaint || 'General Visit'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => createSuperbill(encounter.id)}
                        disabled={creating}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-teal-100 p-3">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Superbills</p>
                <p className="text-2xl font-bold">{superbills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Charges</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(superbills.reduce((sum, s) => sum + s.totalCharges, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Emailed</p>
                <p className="text-2xl font-bold">
                  {superbills.filter(s => s.emailedAt).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Printer className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Printed</p>
                <p className="text-2xl font-bold">
                  {superbills.filter(s => s.printedAt).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by patient name or superbill number..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Superbills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Superbill History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : superbills.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-300" />
              <p>No superbills found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Superbill #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Procedures</TableHead>
                    <TableHead className="text-right">Total Charges</TableHead>
                    <TableHead className="text-right">Patient Owes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {superbills.map((superbill) => (
                    <TableRow
                      key={superbill.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedSuperbill(superbill)
                        setPreviewOpen(true)
                      }}
                    >
                      <TableCell className="font-medium">
                        {superbill.superbillNumber}
                      </TableCell>
                      <TableCell>
                        {superbill.patient.lastName}, {superbill.patient.firstName}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(superbill.serviceDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {superbill.procedures.slice(0, 2).map((proc) => (
                            <Badge key={proc.code} variant="outline" className="text-xs">
                              {proc.code}
                            </Badge>
                          ))}
                          {superbill.procedures.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{superbill.procedures.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(superbill.totalCharges)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={superbill.patientEstimate > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                          {formatCurrency(superbill.patientEstimate - superbill.amountPaid)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {superbill.printedAt && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              <Printer className="h-3 w-3 mr-1" />
                              Printed
                            </Badge>
                          )}
                          {superbill.emailedAt && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Mail className="h-3 w-3 mr-1" />
                              Emailed
                            </Badge>
                          )}
                          {!superbill.printedAt && !superbill.emailedAt && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSuperbill(superbill)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(superbill.id)}
                            disabled={downloading === superbill.id}
                          >
                            <Download className={`h-4 w-4 ${downloading === superbill.id ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printSuperbill(superbill.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => emailSuperbill(superbill.id)}
                            disabled={emailing === superbill.id}
                          >
                            <Mail className={`h-4 w-4 ${emailing === superbill.id ? 'animate-pulse' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Superbill Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Superbill Preview</DialogTitle>
            <DialogDescription>
              {selectedSuperbill?.superbillNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedSuperbill && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold">Medical Practice</h3>
                  <p className="text-sm text-gray-500">123 Healthcare Ave</p>
                  <p className="text-sm text-gray-500">City, State 12345</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Service Date</p>
                  <p className="font-medium">{formatDate(selectedSuperbill.serviceDate)}</p>
                  <p className="text-sm text-gray-500 mt-2">Superbill #</p>
                  <p className="font-medium">{selectedSuperbill.superbillNumber}</p>
                </div>
              </div>

              {/* Patient & Provider */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="font-medium">
                    {selectedSuperbill.patient.lastName}, {selectedSuperbill.patient.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider</p>
                  <p className="font-medium">
                    {selectedSuperbill.provider.firstName} {selectedSuperbill.provider.lastName}
                  </p>
                  <p className="text-sm text-gray-500">NPI: {selectedSuperbill.provider.npi}</p>
                </div>
              </div>

              {/* Diagnoses */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Diagnoses</p>
                <div className="space-y-1">
                  {selectedSuperbill.diagnoses.map((dx, i) => (
                    <div key={dx.code} className="flex gap-2 text-sm">
                      <Badge variant="outline">{dx.code}</Badge>
                      <span>{dx.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedures */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Procedures</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CPT</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSuperbill.procedures.map((proc) => (
                      <TableRow key={proc.code}>
                        <TableCell>
                          <Badge variant="outline">{proc.code}</Badge>
                        </TableCell>
                        <TableCell>{proc.description}</TableCell>
                        <TableCell className="text-center">{proc.units}</TableCell>
                        <TableCell className="text-right">{formatCurrency(proc.fee * proc.units)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Charges</span>
                  <span className="font-medium">{formatCurrency(selectedSuperbill.totalCharges)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Insurance Estimate</span>
                  <span>{formatCurrency(selectedSuperbill.totalCharges - selectedSuperbill.patientEstimate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Patient Estimate</span>
                  <span>{formatCurrency(selectedSuperbill.patientEstimate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid Today</span>
                  <span className="text-green-600">{formatCurrency(selectedSuperbill.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Balance Due</span>
                  <span className={selectedSuperbill.patientEstimate - selectedSuperbill.amountPaid > 0 ? 'text-orange-600' : 'text-green-600'}>
                    {formatCurrency(selectedSuperbill.patientEstimate - selectedSuperbill.amountPaid)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadPDF(selectedSuperbill.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    emailSuperbill(selectedSuperbill.id)
                    setPreviewOpen(false)
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email to Patient
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
