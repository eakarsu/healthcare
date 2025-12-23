'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Label } from '@/components/ui/label'
import {
  Phone,
  Send,
  Inbox,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'

interface FaxMessage {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  status: string
  statusDescription: string
  fromNumber: string
  toNumber: string
  numPages: number | null
  category: string | null
  patient: string | null
  sentAt: string | null
  receivedAt: string | null
  errorMessage: string | null
  hasDocument: boolean
  createdAt: string
}

export default function FaxPage() {
  const [faxes, setFaxes] = useState<FaxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [composeOpen, setComposeOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedFax, setSelectedFax] = useState<FaxMessage | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Compose form
  const [toNumber, setToNumber] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchFaxes()
  }, [page, tab])

  const fetchFaxes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (tab !== 'all') {
        params.append('direction', tab.toUpperCase())
      }

      const response = await fetch(`/api/fax?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFaxes(data.faxes || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch faxes:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFax = async () => {
    if (!toNumber || !selectedFile) return

    setSending(true)
    try {
      // First upload the file
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('category', 'FAX')

      const uploadRes = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload file')

      const uploadData = await uploadRes.json()

      // Then send the fax
      const response = await fetch('/api/fax/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toNumber,
          documentPath: uploadData.data.path,
        }),
      })

      if (response.ok) {
        setComposeOpen(false)
        setToNumber('')
        setSelectedFile(null)
        fetchFaxes()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send fax')
      }
    } catch (error) {
      console.error('Failed to send fax:', error)
      alert('Failed to send fax')
    } finally {
      setSending(false)
    }
  }

  const downloadFax = async (id: string) => {
    try {
      const response = await fetch(`/api/fax/${id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fax-${id}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download fax:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENDING: 'bg-blue-100 text-blue-800',
      SENT: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      RECEIVED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'RECEIVED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fax</h1>
          <p className="text-gray-500">Send and receive faxes electronically</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => setComposeOpen(true)}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Fax
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Inbox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inbox</p>
                <p className="text-2xl font-bold">
                  {faxes.filter((f) => f.direction === 'INBOUND').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-teal-100 p-3">
                <Send className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold">
                  {faxes.filter((f) => f.direction === 'OUTBOUND' && f.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {faxes.filter((f) => ['PENDING', 'SENDING'].includes(f.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold">
                  {faxes.filter((f) => f.status === 'FAILED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fax List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fax Messages</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search faxes..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inbound">
                <ArrowDownLeft className="mr-1 h-4 w-4" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="outbound">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                </div>
              ) : faxes.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                  <Phone className="mb-4 h-12 w-12 text-gray-300" />
                  <p>No faxes found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Direction</TableHead>
                      <TableHead>From/To</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faxes.map((fax) => (
                      <TableRow
                        key={fax.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => { setSelectedFax(fax); setDetailOpen(true) }}
                      >
                        <TableCell>
                          {fax.direction === 'INBOUND' ? (
                            <Badge variant="outline" className="bg-blue-50">
                              <ArrowDownLeft className="mr-1 h-3 w-3" />
                              Received
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-teal-50">
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                              Sent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {fax.direction === 'INBOUND'
                            ? formatPhoneNumber(fax.fromNumber)
                            : formatPhoneNumber(fax.toNumber)}
                        </TableCell>
                        <TableCell>{fax.numPages || '-'}</TableCell>
                        <TableCell>{fax.patient || '-'}</TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(fax.receivedAt || fax.sentAt || fax.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(fax.status)}
                            <Badge className={getStatusColor(fax.status)}>
                              {fax.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {fax.hasDocument && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFax(fax.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>

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
        </CardContent>
      </Card>

      {/* Compose Fax Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Fax</DialogTitle>
            <DialogDescription>
              Send a document via fax
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Recipient Fax Number</Label>
              <Input
                className="mt-1"
                placeholder="+1 (555) 123-4567"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
              />
            </div>

            <div>
              <Label>Document</Label>
              <div
                className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => document.getElementById('fax-file')?.click()}
              >
                <input
                  id="fax-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-teal-600" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-gray-600">Click to select a document</p>
                    <p className="text-sm text-gray-400">PDF, PNG, JPG, TIFF</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={sendFax}
                disabled={!toNumber || !selectedFile || sending}
              >
                {sending ? 'Sending...' : 'Send Fax'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fax Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFax?.direction === 'INBOUND' ? (
                <>
                  <ArrowDownLeft className="h-5 w-5 text-blue-600" />
                  Received Fax
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5 text-teal-600" />
                  Sent Fax
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Fax details and status information
            </DialogDescription>
          </DialogHeader>
          {selectedFax && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(selectedFax.status)}
                    <Badge className={getStatusColor(selectedFax.status)}>
                      {selectedFax.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Pages</Label>
                  <p className="mt-1 font-medium">{selectedFax.numPages || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">From</Label>
                  <p className="mt-1 font-mono">{formatPhoneNumber(selectedFax.fromNumber)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">To</Label>
                  <p className="mt-1 font-mono">{formatPhoneNumber(selectedFax.toNumber)}</p>
                </div>
              </div>

              {selectedFax.patient && (
                <div>
                  <Label className="text-gray-500">Patient</Label>
                  <p className="mt-1 font-medium">{selectedFax.patient}</p>
                </div>
              )}

              {selectedFax.category && (
                <div>
                  <Label className="text-gray-500">Category</Label>
                  <p className="mt-1">{selectedFax.category}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedFax.sentAt && (
                  <div>
                    <Label className="text-gray-500">Sent At</Label>
                    <p className="mt-1 text-sm">{new Date(selectedFax.sentAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedFax.receivedAt && (
                  <div>
                    <Label className="text-gray-500">Received At</Label>
                    <p className="mt-1 text-sm">{new Date(selectedFax.receivedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedFax.errorMessage && (
                <div className="rounded-lg bg-red-50 p-3">
                  <Label className="text-red-700">Error</Label>
                  <p className="mt-1 text-sm text-red-600">{selectedFax.errorMessage}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedFax.hasDocument && (
                  <Button
                    variant="outline"
                    onClick={() => downloadFax(selectedFax.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
                <Button onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
