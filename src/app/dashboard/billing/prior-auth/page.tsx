'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, FileText, Send, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

interface PriorAuth {
  id: string
  status: string
  urgency: string
  serviceType: string
  procedureCodes: string[]
  diagnosisCodes: string[]
  requestDate: string
  serviceDate?: string
  expirationDate?: string
  authNumber?: string
  denialReason?: string
  patient: {
    firstName: string
    lastName: string
    mrn: string
  }
  provider: {
    user: { firstName: string; lastName: string }
  }
  insurance: {
    insurancePlan: { name: string; payerName: string }
  }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  PARTIALLY_APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  APPEALED: 'bg-orange-100 text-orange-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  SUBMITTED: <Send className="h-4 w-4" />,
  IN_REVIEW: <RefreshCw className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  PARTIALLY_APPROVED: <CheckCircle className="h-4 w-4" />,
  DENIED: <XCircle className="h-4 w-4" />,
  APPEALED: <AlertTriangle className="h-4 w-4" />,
  EXPIRED: <Clock className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />
}

export default function PriorAuthPage() {
  const [authorizations, setAuthorizations] = useState<PriorAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAuth, setSelectedAuth] = useState<PriorAuth | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)

  useEffect(() => {
    fetchAuthorizations()
  }, [statusFilter])

  const fetchAuthorizations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/prior-auth?${params}`)
      const data = await response.json()
      if (response.ok) {
        setAuthorizations(data.data.authorizations)
      }
    } catch (error) {
      console.error('Failed to fetch authorizations:', error)
    }
    setLoading(false)
  }

  const generateLetter = async (authId: string, type: 'justification' | 'appeal') => {
    try {
      const response = await fetch(`/api/prior-auth/${authId}/generate-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const data = await response.json()
      if (response.ok) {
        setGeneratedLetter(data.data.letter)
      }
    } catch (error) {
      console.error('Failed to generate letter:', error)
    }
  }

  // Mock data for demo
  const mockAuths: PriorAuth[] = [
    {
      id: '1',
      status: 'APPROVED',
      urgency: 'STANDARD',
      serviceType: 'Imaging',
      procedureCodes: ['72148'],
      diagnosisCodes: ['M54.5'],
      requestDate: '2024-01-15',
      serviceDate: '2024-01-22',
      expirationDate: '2024-04-22',
      authNumber: 'AUTH-2024-001234',
      patient: { firstName: 'John', lastName: 'Smith', mrn: 'MRN-001' },
      provider: { user: { firstName: 'Sarah', lastName: 'Johnson' } },
      insurance: { insurancePlan: { name: 'Blue Shield PPO', payerName: 'Blue Cross Blue Shield' } }
    },
    {
      id: '2',
      status: 'PENDING',
      urgency: 'URGENT',
      serviceType: 'Surgical',
      procedureCodes: ['27447'],
      diagnosisCodes: ['M17.11'],
      requestDate: '2024-01-18',
      serviceDate: '2024-02-01',
      patient: { firstName: 'Jane', lastName: 'Doe', mrn: 'MRN-002' },
      provider: { user: { firstName: 'Michael', lastName: 'Chen' } },
      insurance: { insurancePlan: { name: 'Aetna HMO', payerName: 'Aetna' } }
    },
    {
      id: '3',
      status: 'DENIED',
      urgency: 'STANDARD',
      serviceType: 'Medical',
      procedureCodes: ['64483'],
      diagnosisCodes: ['M54.16'],
      requestDate: '2024-01-10',
      denialReason: 'Medical necessity not demonstrated. Conservative treatment documentation insufficient.',
      patient: { firstName: 'Robert', lastName: 'Johnson', mrn: 'MRN-003' },
      provider: { user: { firstName: 'Sarah', lastName: 'Johnson' } },
      insurance: { insurancePlan: { name: 'UHC Choice Plus', payerName: 'UnitedHealthcare' } }
    },
    {
      id: '4',
      status: 'IN_REVIEW',
      urgency: 'STANDARD',
      serviceType: 'DME',
      procedureCodes: ['E0601'],
      diagnosisCodes: ['G47.33'],
      requestDate: '2024-01-17',
      patient: { firstName: 'Emily', lastName: 'Williams', mrn: 'MRN-004' },
      provider: { user: { firstName: 'David', lastName: 'Lee' } },
      insurance: { insurancePlan: { name: 'Cigna OAP', payerName: 'Cigna' } }
    }
  ]

  const displayAuths = authorizations.length > 0 ? authorizations : mockAuths

  // Summary stats
  const stats = {
    total: displayAuths.length,
    pending: displayAuths.filter(a => ['PENDING', 'SUBMITTED', 'IN_REVIEW'].includes(a.status)).length,
    approved: displayAuths.filter(a => ['APPROVED', 'PARTIALLY_APPROVED'].includes(a.status)).length,
    denied: displayAuths.filter(a => a.status === 'DENIED').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prior Authorizations</h1>
          <p className="text-muted-foreground">
            Manage prior authorization requests and track approvals
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
            <div className="text-sm text-muted-foreground">Denied</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DENIED">Denied</SelectItem>
                  <SelectItem value="APPEALED">Appealed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Search patient or auth number..." className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Authorizations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayAuths.map(auth => (
                <TableRow key={auth.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{auth.patient.firstName} {auth.patient.lastName}</div>
                      <div className="text-sm text-muted-foreground">{auth.patient.mrn}</div>
                    </div>
                  </TableCell>
                  <TableCell>{auth.serviceType}</TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{auth.procedureCodes.join(', ')}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{auth.insurance.insurancePlan.payerName}</div>
                      <div className="text-xs text-muted-foreground">{auth.insurance.insurancePlan.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[auth.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[auth.status]}
                        {auth.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    {auth.urgency === 'URGENT' && (
                      <Badge variant="destructive" className="ml-1">URGENT</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(auth.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAuth(auth)}>
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Prior Authorization Details</DialogTitle>
                            <DialogDescription>
                              {auth.patient.firstName} {auth.patient.lastName} - {auth.serviceType}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Auth Number</label>
                                <p className="font-mono">{auth.authNumber || 'Pending'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Badge className={statusColors[auth.status]}>{auth.status}</Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Procedure Codes</label>
                                <p className="font-mono">{auth.procedureCodes.join(', ')}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Diagnosis Codes</label>
                                <p className="font-mono">{auth.diagnosisCodes.join(', ')}</p>
                              </div>
                              {auth.serviceDate && (
                                <div>
                                  <label className="text-sm font-medium">Service Date</label>
                                  <p>{new Date(auth.serviceDate).toLocaleDateString()}</p>
                                </div>
                              )}
                              {auth.expirationDate && (
                                <div>
                                  <label className="text-sm font-medium">Expiration</label>
                                  <p>{new Date(auth.expirationDate).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            {auth.denialReason && (
                              <div className="bg-red-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-red-800">Denial Reason</label>
                                <p className="text-red-700">{auth.denialReason}</p>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => generateLetter(auth.id, 'justification')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Letter
                              </Button>
                              {auth.status === 'DENIED' && (
                                <Button variant="outline" onClick={() => generateLetter(auth.id, 'appeal')}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Generate Appeal
                                </Button>
                              )}
                            </div>
                            {generatedLetter && (
                              <div className="mt-4">
                                <label className="text-sm font-medium">Generated Letter</label>
                                <Textarea value={generatedLetter} rows={15} className="mt-2 font-mono text-sm" />
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {auth.status === 'DENIED' && (
                        <Button variant="destructive" size="sm">
                          Appeal
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
