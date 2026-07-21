'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  FileText,
  Send,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  Building2,
  Pencil,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ClaimLine {
  id: string
  lineNumber: number
  cptCode: string
  description: string
  modifiers: string[]
  quantity: number
  chargeAmount: number
  diagnosisPointers: number[]
}

interface ClaimPayment {
  id: string
  paymentDate: string
  payerType: string
  amount: number
  checkNumber: string | null
  reference: string | null
}

interface ClaimDetail {
  id: string
  claimNumber: string
  status: string
  serviceDate: string
  submittedDate: string | null
  totalCharges: number
  paidAmount: number | null
  adjustmentAmount: number | null
  patientResponsibility: number | null
  patient: {
    id: string
    firstName: string
    lastName: string
    mrn: string
    dateOfBirth: string
  }
  provider: {
    user: { firstName: string; lastName: string }
    npi: string
  }
  insurancePlan: {
    name: string
    payerName: string
    payerId: string
  } | null
  encounter: {
    id: string
    encounterNumber: string
    diagnoses: Array<{ icdCode: string; description: string; sequence: number }>
  } | null
  lines: ClaimLine[]
  payments: ClaimPayment[]
}

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    payerType: 'Insurance',
    checkNumber: '',
    reference: '',
  })

  // Edit claim dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    adjustmentAmount: '',
  })

  useEffect(() => {
    fetchClaim()
  }, [id])

  const fetchClaim = async () => {
    try {
      const response = await fetch(`/api/claims/${id}`)
      if (response.ok) {
        const data = await response.json()
        setClaim(data)
      }
    } catch (error) {
      console.error('Failed to fetch claim:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitClaim = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/claims/${id}/submit`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Claim submitted',
          description: 'The claim has been submitted to the payer.',
        })
        fetchClaim()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to submit claim',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to submit claim:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit claim',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePostPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      })
      return
    }

    setPaymentSaving(true)
    try {
      const response = await fetch(`/api/claims/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDate: paymentForm.paymentDate,
          amount: parseFloat(paymentForm.amount),
          payerType: paymentForm.payerType,
          checkNumber: paymentForm.checkNumber || null,
          reference: paymentForm.reference || null,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Payment posted',
          description: 'The payment has been recorded successfully.',
        })
        setPaymentDialogOpen(false)
        setPaymentForm({
          paymentDate: new Date().toISOString().split('T')[0],
          amount: '',
          payerType: 'Insurance',
          checkNumber: '',
          reference: '',
        })
        fetchClaim()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to post payment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to post payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to post payment',
        variant: 'destructive',
      })
    } finally {
      setPaymentSaving(false)
    }
  }

  const openEditDialog = () => {
    if (claim) {
      setEditForm({
        adjustmentAmount: claim.adjustmentAmount?.toString() || '',
      })
      setEditDialogOpen(true)
    }
  }

  const handleEditClaim = async () => {
    setEditSaving(true)
    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustmentAmount: editForm.adjustmentAmount ? parseFloat(editForm.adjustmentAmount) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Claim updated',
          description: 'The claim has been updated successfully.',
        })
        setEditDialogOpen(false)
        fetchClaim()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update claim',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update claim:', error)
      toast({
        title: 'Error',
        description: 'Failed to update claim',
        variant: 'destructive',
      })
    } finally {
      setEditSaving(false)
    }
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
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'DENIED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
      case 'SUBMITTED':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'APPEALED':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500">
        <FileText className="mb-4 h-12 w-12 text-gray-300" />
        <p>Claim not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/billing/claims">Back to Claims</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/billing/claims">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{claim.claimNumber}</h1>
              <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
            </div>
            <p className="text-gray-500">Service Date: {formatDate(claim.serviceDate)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {claim.status === 'CREATED' || claim.status === 'VALIDATED' ? (
            <>
              <Button variant="outline" onClick={openEditDialog}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Claim
              </Button>
              <Button
                onClick={submitClaim}
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              >
                {submitting ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Claim
              </Button>
            </>
          ) : claim.status === 'DENIED' ? (
            <Button className="bg-orange-600 hover:bg-orange-700">
              <AlertTriangle className="mr-2 h-4 w-4" />
              File Appeal
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Charges</p>
                <p className="text-xl font-bold">{formatCurrency(Number(claim.totalCharges) || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-xl font-bold">{formatCurrency(Number(claim.paidAmount) || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Adjustments</p>
                <p className="text-xl font-bold">{formatCurrency(Number(claim.adjustmentAmount) || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance Due</p>
                <p className="text-xl font-bold">{formatCurrency((Number(claim.totalCharges) || 0) - (Number(claim.paidAmount) || 0) - (Number(claim.adjustmentAmount) || 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Claim Details</TabsTrigger>
          <TabsTrigger value="lines">Service Lines</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <Link
                    href={`/dashboard/patients/${claim.patient.id}`}
                    className="font-medium hover:text-teal-600"
                  >
                    {claim.patient.lastName}, {claim.patient.firstName}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">MRN</p>
                    <p>{claim.patient.mrn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{formatDate(claim.patient.dateOfBirth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {claim.insurancePlan ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Payer</p>
                      <p className="font-medium">{claim.insurancePlan.payerName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Plan</p>
                        <p>{claim.insurancePlan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payer ID</p>
                        <p>{claim.insurancePlan.payerId}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Self-Pay</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Diagnoses */}
          {claim.encounter && claim.encounter.diagnoses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {claim.encounter.diagnoses.map((dx, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Badge variant={dx.sequence === 1 ? 'default' : 'outline'}>
                        {dx.icdCode}
                      </Badge>
                      <span>{dx.description}</span>
                      {dx.sequence === 1 && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lines">
          <Card>
            <CardHeader>
              <CardTitle>Service Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line #</TableHead>
                    <TableHead>CPT Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mod</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claim.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.lineNumber}</TableCell>
                      <TableCell className="font-medium">{line.cptCode}</TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell>{line.modifiers?.join(', ') || '-'}</TableCell>
                      <TableCell className="text-center">{line.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(line.chargeAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 font-medium">
                    <TableCell colSpan={5} className="text-right">Total Charges:</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(claim.totalCharges) || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payments</CardTitle>
                <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Post Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {claim.payments.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-gray-500">
                  <p>No payments recorded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Check/Ref #</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claim.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.payerType}</TableCell>
                        <TableCell>{payment.checkNumber || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.reference || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(claim.status)}
                  <div>
                    <p className="font-medium">Current Status: {claim.status}</p>
                    <p className="text-sm text-gray-500">
                      {claim.submittedDate
                        ? `Submitted on ${formatDate(claim.submittedDate)}`
                        : 'Not yet submitted'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Post Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerType">Payer Type</Label>
              <Select
                value={paymentForm.payerType}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkNumber">Check/EFT Number (Optional)</Label>
              <Input
                id="checkNumber"
                value={paymentForm.checkNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, checkNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePostPayment}
              disabled={paymentSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {paymentSaving ? 'Posting...' : 'Post Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Claim Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Claim</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentAmount">Adjustment Amount</Label>
              <Input
                id="adjustmentAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editForm.adjustmentAmount}
                onChange={(e) => setEditForm({ ...editForm, adjustmentAmount: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditClaim}
              disabled={editSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
