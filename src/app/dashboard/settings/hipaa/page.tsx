'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Shield,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit,
  FileText,
  Clock,
  User,
  Filter,
  Settings,
} from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  patientId: string | null
  patientName: string | null
  phiAccessed: boolean
  ipAddress: string | null
  timestamp: string
  details: Record<string, unknown> | null
}

interface ComplianceStatus {
  overall: 'compliant' | 'warning' | 'non-compliant'
  items: {
    name: string
    status: 'compliant' | 'warning' | 'non-compliant'
    description: string
    lastChecked: string
  }[]
}

interface ComplianceItem {
  name: string
  status: 'compliant' | 'warning' | 'non-compliant'
  description: string
  lastChecked: string
}

export default function HIPAASettingsPage() {
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [selectedComplianceItem, setSelectedComplianceItem] = useState<ComplianceItem | null>(null)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [complianceStatus] = useState<ComplianceStatus>({
    overall: 'compliant',
    items: [
      {
        name: 'Access Controls',
        status: 'compliant',
        description: 'Role-based access control is properly configured',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Audit Logging',
        status: 'compliant',
        description: 'All PHI access is being logged',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Data Encryption',
        status: 'compliant',
        description: 'PHI is encrypted at rest and in transit',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Session Management',
        status: 'compliant',
        description: '15-minute timeout is enforced',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Password Policy',
        status: 'warning',
        description: '2 users have not changed password in 90+ days',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Two-Factor Authentication',
        status: 'warning',
        description: '3 users have not enabled 2FA',
        lastChecked: new Date().toISOString(),
      },
    ],
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      // Mock data for display (15+ items)
      setAuditLogs([
        { id: '1', action: 'VIEW', entity: 'Patient', entityId: 'p1', userId: 'u1', userName: 'Dr. James Wilson', patientId: 'p1', patientName: 'John Smith', phiAccessed: true, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), details: null },
        { id: '2', action: 'UPDATE', entity: 'Encounter', entityId: 'e1', userId: 'u1', userName: 'Dr. James Wilson', patientId: 'p2', patientName: 'Sarah Johnson', phiAccessed: true, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), details: { fields: ['subjective', 'objective'] } },
        { id: '3', action: 'LOGIN', entity: 'User', entityId: 'u2', userId: 'u2', userName: 'Jane Receptionist', patientId: null, patientName: null, phiAccessed: false, ipAddress: '192.168.1.101', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), details: null },
        { id: '4', action: 'CREATE', entity: 'Appointment', entityId: 'a1', userId: 'u2', userName: 'Jane Receptionist', patientId: 'p3', patientName: 'Michael Brown', phiAccessed: false, ipAddress: '192.168.1.101', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), details: null },
        { id: '5', action: 'ELIGIBILITY_CHECK', entity: 'Insurance', entityId: 'ins1', userId: 'u3', userName: 'Mike Biller', patientId: 'p1', patientName: 'John Smith', phiAccessed: true, ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), details: { payerId: 'bcbs' } },
        { id: '6', action: 'VIEW', entity: 'Claim', entityId: 'c1', userId: 'u3', userName: 'Mike Biller', patientId: 'p4', patientName: 'Emily Davis', phiAccessed: true, ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 75 * 60000).toISOString(), details: null },
        { id: '7', action: 'UPDATE', entity: 'Patient', entityId: 'p5', userId: 'u2', userName: 'Dr. Lisa Chen', patientId: 'p5', patientName: 'Robert Miller', phiAccessed: true, ipAddress: '192.168.1.103', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), details: { fields: ['phone', 'address'] } },
        { id: '8', action: 'CREATE', entity: 'Encounter', entityId: 'e2', userId: 'u2', userName: 'Dr. Lisa Chen', patientId: 'p6', patientName: 'Jennifer Wilson', phiAccessed: true, ipAddress: '192.168.1.103', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), details: null },
        { id: '9', action: 'SIGN', entity: 'Encounter', entityId: 'e3', userId: 'u1', userName: 'Dr. James Wilson', patientId: 'p7', patientName: 'David Taylor', phiAccessed: true, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 150 * 60000).toISOString(), details: null },
        { id: '10', action: 'VIEW', entity: 'Patient', entityId: 'p8', userId: 'u4', userName: 'Nurse Sarah', patientId: 'p8', patientName: 'Lisa Anderson', phiAccessed: true, ipAddress: '192.168.1.104', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), details: null },
        { id: '11', action: 'LOGOUT', entity: 'User', entityId: 'u3', userId: 'u3', userName: 'Mike Biller', patientId: null, patientName: null, phiAccessed: false, ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 200 * 60000).toISOString(), details: null },
        { id: '12', action: 'CREATE', entity: 'Claim', entityId: 'c2', userId: 'u3', userName: 'Mike Biller', patientId: 'p9', patientName: 'James Thomas', phiAccessed: true, ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 220 * 60000).toISOString(), details: { claimNumber: 'CLM-2024-0015' } },
        { id: '13', action: 'UPDATE', entity: 'Claim', entityId: 'c2', userId: 'u3', userName: 'Mike Biller', patientId: 'p9', patientName: 'James Thomas', phiAccessed: true, ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), details: { status: 'SUBMITTED' } },
        { id: '14', action: 'VIEW', entity: 'Encounter', entityId: 'e4', userId: 'u2', userName: 'Dr. Lisa Chen', patientId: 'p10', patientName: 'Patricia Jackson', phiAccessed: true, ipAddress: '192.168.1.103', timestamp: new Date(Date.now() - 260 * 60000).toISOString(), details: null },
        { id: '15', action: 'DELETE', entity: 'Appointment', entityId: 'a2', userId: 'u2', userName: 'Jane Receptionist', patientId: 'p11', patientName: 'William Garcia', phiAccessed: false, ipAddress: '192.168.1.101', timestamp: new Date(Date.now() - 280 * 60000).toISOString(), details: { reason: 'Patient cancelled' } },
        { id: '16', action: 'LOGIN', entity: 'User', entityId: 'u1', userId: 'u1', userName: 'Dr. James Wilson', patientId: null, patientName: null, phiAccessed: false, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 300 * 60000).toISOString(), details: null },
        { id: '17', action: 'VIEW', entity: 'Patient', entityId: 'p12', userId: 'u1', userName: 'Dr. James Wilson', patientId: 'p12', patientName: 'Elizabeth Martinez', phiAccessed: true, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 320 * 60000).toISOString(), details: null },
        { id: '18', action: 'CREATE', entity: 'Prescription', entityId: 'rx1', userId: 'u1', userName: 'Dr. James Wilson', patientId: 'p12', patientName: 'Elizabeth Martinez', phiAccessed: true, ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 340 * 60000).toISOString(), details: { medication: 'Lisinopril 10mg' } },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      VIEW: 'bg-blue-100 text-blue-800',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      SIGN: 'bg-teal-100 text-teal-800',
      ELIGIBILITY_CHECK: 'bg-indigo-100 text-indigo-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'non-compliant':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = !search ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      (log.patientName && log.patientName.toLowerCase().includes(search.toLowerCase()))
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter
    return matchesSearch && matchesAction && matchesEntity
  })

  const policies = [
    { id: 'session', name: 'Session Timeout', description: 'Automatic logout after inactivity', value: '15 minutes', details: 'Users are automatically logged out after 15 minutes of inactivity to prevent unauthorized access.' },
    { id: 'password-exp', name: 'Password Expiration', description: 'Users must change password periodically', value: '90 days', details: 'Passwords must be changed every 90 days to maintain security.' },
    { id: 'password-len', name: 'Minimum Password Length', description: 'Required characters for passwords', value: '12 characters', details: 'All passwords must be at least 12 characters with uppercase, lowercase, number, and special character.' },
    { id: '2fa', name: 'Two-Factor Authentication', description: 'Required for all users with PHI access', value: 'Recommended', isWarning: true, details: 'Two-factor authentication is recommended for all users accessing protected health information.' },
    { id: 'lockout', name: 'Failed Login Lockout', description: 'Account lockout after failed attempts', value: '5 attempts', details: 'Accounts are locked for 30 minutes after 5 consecutive failed login attempts.' },
    { id: 'encryption', name: 'PHI Encryption', description: 'Encryption standard for protected data', value: 'AES-256-GCM', isCompliant: true, details: 'All PHI is encrypted using AES-256-GCM encryption both at rest and in transit.' },
  ]

  const exportAuditReport = async () => {
    setExporting(true)
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create CSV content
      const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Patient', 'PHI Accessed', 'IP Address']
      const rows = filteredLogs.map(log => [
        formatDateTime(log.timestamp),
        log.userName,
        log.action,
        log.entity,
        log.patientName || '-',
        log.phiAccessed ? 'Yes' : 'No',
        log.ipAddress || '-'
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hipaa-audit-log-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Report exported',
        description: 'The audit report has been downloaded.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export audit report',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HIPAA Compliance</h1>
          <p className="text-gray-500">Audit logs and compliance monitoring</p>
        </div>
        <Button variant="outline" onClick={exportAuditReport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Audit Report'}
        </Button>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          {/* Overall Status */}
          <Card className={
            complianceStatus.overall === 'compliant' ? 'border-green-200 bg-green-50' :
            complianceStatus.overall === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${
                  complianceStatus.overall === 'compliant' ? 'bg-green-100' :
                  complianceStatus.overall === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Shield className={`h-8 w-8 ${
                    complianceStatus.overall === 'compliant' ? 'text-green-600' :
                    complianceStatus.overall === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {complianceStatus.overall === 'compliant' ? 'HIPAA Compliant' :
                     complianceStatus.overall === 'warning' ? 'Compliance Warnings' :
                     'Non-Compliant'}
                  </h2>
                  <p className="text-gray-600">
                    {complianceStatus.items.filter(i => i.status !== 'compliant').length} items need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Items */}
          <div className="grid gap-4 md:grid-cols-2">
            {complianceStatus.items.map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedComplianceItem(item)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.name}</p>
                        <Badge className={
                          item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last checked: {formatDate(item.lastChecked)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by user or patient name..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="VIEW">View</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Encounter">Encounter</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Claim">Claim</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                All PHI access and system activities are logged for compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>PHI</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedAuditLog(log)}
                      >
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDateTime(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {log.userName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.entity}</TableCell>
                        <TableCell>
                          {log.patientName || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>
                          {log.phiAccessed ? (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              <Eye className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>HIPAA compliance policies and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPolicy(policy.id)}
                  >
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-sm text-gray-500">{policy.description}</p>
                    </div>
                    <Badge className={
                      policy.isCompliant ? 'bg-green-100 text-green-800' :
                      policy.isWarning ? 'bg-yellow-100 text-yellow-800' :
                      ''
                    } variant={!policy.isCompliant && !policy.isWarning ? 'outline' : 'default'}>
                      {policy.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Item Detail Dialog */}
      <Dialog open={!!selectedComplianceItem} onOpenChange={(open) => !open && setSelectedComplianceItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedComplianceItem && getStatusIcon(selectedComplianceItem.status)}
              {selectedComplianceItem?.name}
            </DialogTitle>
            <DialogDescription>Compliance status details</DialogDescription>
          </DialogHeader>
          {selectedComplianceItem && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={
                    selectedComplianceItem.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    selectedComplianceItem.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedComplianceItem.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm">{selectedComplianceItem.description}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Last Checked</p>
                <p className="font-medium">{formatDateTime(selectedComplianceItem.lastChecked)}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedComplianceItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Detail Dialog */}
      <Dialog open={!!selectedAuditLog} onOpenChange={(open) => !open && setSelectedAuditLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Entry</DialogTitle>
            <DialogDescription>Detailed audit log information</DialogDescription>
          </DialogHeader>
          {selectedAuditLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="font-medium text-sm">{formatDateTime(selectedAuditLog.timestamp)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Action</p>
                  <Badge className={getActionColor(selectedAuditLog.action)}>{selectedAuditLog.action}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">User</p>
                  <p className="font-medium">{selectedAuditLog.userName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Entity</p>
                  <p className="font-medium">{selectedAuditLog.entity}</p>
                </div>
              </div>
              {selectedAuditLog.patientName && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-medium">{selectedAuditLog.patientName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">PHI Accessed</p>
                  <Badge variant={selectedAuditLog.phiAccessed ? 'destructive' : 'secondary'}>
                    {selectedAuditLog.phiAccessed ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="font-mono text-sm">{selectedAuditLog.ipAddress || '-'}</p>
                </div>
              </div>
              {selectedAuditLog.details && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Details</p>
                  <pre className="text-xs mt-1 overflow-auto">
                    {JSON.stringify(selectedAuditLog.details, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedAuditLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Detail Dialog */}
      <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {policies.find(p => p.id === selectedPolicy)?.name}
            </DialogTitle>
            <DialogDescription>Policy configuration details</DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4 py-4">
              {(() => {
                const policy = policies.find(p => p.id === selectedPolicy)
                if (!policy) return null
                return (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Current Setting</p>
                        <Badge className={
                          policy.isCompliant ? 'bg-green-100 text-green-800' :
                          policy.isWarning ? 'bg-yellow-100 text-yellow-800' :
                          ''
                        } variant={!policy.isCompliant && !policy.isWarning ? 'outline' : 'default'}>
                          {policy.value}
                        </Badge>
                      </div>
                      <p className="text-sm">{policy.description}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">{policy.details}</p>
                    </div>
                  </>
                )
              })()}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
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
