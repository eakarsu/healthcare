'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { DollarSign, Plus, Search, CreditCard, Wallet } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PatientPaymentModal } from '@/components/payments'

interface Payment {
  id: string
  paymentDate: string
  paymentType: string
  amount: number
  checkNumber: string | null
  notes: string | null
  claim: {
    id: string
    claimNumber: string
    patient: { firstName: string; lastName: string }
  }
}

interface ClaimOption {
  id: string
  claimNumber: string
  status: string
  totalCharges: number
  patient: { firstName: string; lastName: string }
}

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  mrn: string
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [claims, setClaims] = useState<ClaimOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClaims, setLoadingClaims] = useState(false)
  const [search, setSearch] = useState('')
  const [paymentType, setPaymentType] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [posting, setPosting] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Stripe card payment state
  const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false)
  const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(false)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [cardPaymentAmount, setCardPaymentAmount] = useState('')
  const [cardPaymentDescription, setCardPaymentDescription] = useState('')

  // New payment form
  const [newPayment, setNewPayment] = useState({
    claimId: '',
    paymentType: 'INSURANCE',
    amount: '',
    checkNumber: '',
    notes: '',
  })

  useEffect(() => {
    fetchPayments()
  }, [paymentType])

  useEffect(() => {
    if (isDialogOpen) {
      fetchClaims()
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (isPatientSelectOpen) {
      fetchPatients()
    }
  }, [isPatientSelectOpen])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (paymentType !== 'all') {
        params.append('type', paymentType)
      }

      const response = await fetch(`/api/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClaims = async () => {
    setLoadingClaims(true)
    try {
      const response = await fetch('/api/claims?limit=100')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched claims:', data.data?.length || 0)
        setClaims(data.data || [])
      } else {
        console.error('Failed to fetch claims:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoadingClaims(false)
    }
  }

  const fetchPatients = async () => {
    setLoadingPatients(true)
    try {
      const response = await fetch('/api/patients?limit=100')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const openCardPaymentForPatient = () => {
    if (!selectedPatient || !cardPaymentAmount) {
      toast({
        title: 'Error',
        description: 'Please select a patient and enter an amount',
        variant: 'destructive',
      })
      return
    }
    setIsPatientSelectOpen(false)
    setIsCardPaymentOpen(true)
  }

  const handleCardPaymentSuccess = () => {
    toast({
      title: 'Payment successful',
      description: 'The card payment has been processed.',
    })
    setIsCardPaymentOpen(false)
    setSelectedPatient(null)
    setCardPaymentAmount('')
    setCardPaymentDescription('')
    fetchPayments()
  }

  const postPayment = async () => {
    if (!newPayment.claimId || !newPayment.amount) {
      toast({
        title: 'Error',
        description: 'Claim and amount are required',
        variant: 'destructive',
      })
      return
    }

    setPosting(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: newPayment.claimId,
          paymentType: newPayment.paymentType,
          amount: parseFloat(newPayment.amount),
          checkNumber: newPayment.checkNumber || undefined,
          notes: newPayment.notes || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Payment posted',
          description: 'The payment has been recorded successfully.',
        })
        setIsDialogOpen(false)
        setNewPayment({
          claimId: '',
          paymentType: 'INSURANCE',
          amount: '',
          checkNumber: '',
          notes: '',
        })
        fetchPayments()
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
      setPosting(false)
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      p.claim.claimNumber.toLowerCase().includes(searchLower) ||
      p.claim.patient.firstName.toLowerCase().includes(searchLower) ||
      p.claim.patient.lastName.toLowerCase().includes(searchLower) ||
      (p.checkNumber && p.checkNumber.toLowerCase().includes(searchLower))
    )
  })

  const getPaymentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INSURANCE: 'bg-blue-100 text-blue-800',
      PATIENT: 'bg-green-100 text-green-800',
      ADJUSTMENT: 'bg-gray-100 text-gray-800',
      REFUND: 'bg-red-100 text-red-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Post and track payment transactions</p>
        </div>
        <div className="flex gap-3">
          {/* Collect Card Payment Button */}
          <Button
            variant="outline"
            onClick={() => setIsPatientSelectOpen(true)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Collect Card Payment
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                <Plus className="mr-2 h-4 w-4" />
                Post Payment
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Payment</DialogTitle>
              <DialogDescription>Record a payment against a claim</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="claimId">Claim *</Label>
                <Select
                  value={newPayment.claimId}
                  onValueChange={(v) => setNewPayment({ ...newPayment, claimId: v })}
                  disabled={loadingClaims}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClaims ? "Loading claims..." : "Select a claim"} />
                  </SelectTrigger>
                  <SelectContent>
                    {claims.map((claim) => (
                      <SelectItem key={claim.id} value={claim.id}>
                        {claim.claimNumber} - {claim.patient.lastName}, {claim.patient.firstName} ({formatCurrency(claim.totalCharges)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={newPayment.paymentType}
                  onValueChange={(v) => setNewPayment({ ...newPayment, paymentType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSURANCE">Insurance Payment</SelectItem>
                    <SelectItem value="PATIENT">Patient Payment</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkNumber">Check/Reference Number</Label>
                <Input
                  id="checkNumber"
                  placeholder="Optional"
                  value={newPayment.checkNumber}
                  onChange={(e) => setNewPayment({ ...newPayment, checkNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes..."
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={postPayment}
                  disabled={posting}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {posting ? 'Posting...' : 'Post Payment'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by claim number, patient name, or check number..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="w-48">
                <CreditCard className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="PATIENT">Patient</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <DollarSign className="mb-4 h-12 w-12 text-gray-300" />
              <p>No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Check/Ref #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="font-medium">{payment.claim.claimNumber}</TableCell>
                    <TableCell>
                      {payment.claim.patient.lastName}, {payment.claim.patient.firstName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentTypeColor(payment.paymentType)}>
                        {payment.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.checkNumber || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Payment Details</DialogTitle>
              {selectedPayment && (
                <Badge className={getPaymentTypeColor(selectedPayment.paymentType)}>
                  {selectedPayment.paymentType}
                </Badge>
              )}
            </div>
            <DialogDescription>Payment transaction details</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Date</p>
                  <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Check/Ref #</p>
                  <p className="font-medium">{selectedPayment.checkNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Claim</p>
                <p className="font-medium">{selectedPayment.claim.claimNumber}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Patient</p>
                <p className="font-medium">
                  {selectedPayment.claim.patient.firstName} {selectedPayment.claim.patient.lastName}
                </p>
              </div>

              {selectedPayment.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedPayment.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Patient Selection Dialog for Card Payment */}
      <Dialog open={isPatientSelectOpen} onOpenChange={setIsPatientSelectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-teal-600" />
              Collect Card Payment
            </DialogTitle>
            <DialogDescription>
              Select a patient and enter the payment amount
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select
                value={selectedPatient?.id || ''}
                onValueChange={(v) => {
                  const patient = patients.find(p => p.id === v)
                  setSelectedPatient(patient || null)
                }}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} ({patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="0.00"
                  className="pl-10"
                  value={cardPaymentAmount}
                  onChange={(e) => setCardPaymentAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Minimum amount: $0.50</p>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="e.g., Co-pay, Balance due, etc."
                value={cardPaymentDescription}
                onChange={(e) => setCardPaymentDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsPatientSelectOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={openCardPaymentForPatient}
                disabled={!selectedPatient || !cardPaymentAmount || parseFloat(cardPaymentAmount) < 0.5}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      {selectedPatient && (
        <PatientPaymentModal
          isOpen={isCardPaymentOpen}
          onClose={() => {
            setIsCardPaymentOpen(false)
            setSelectedPatient(null)
            setCardPaymentAmount('')
            setCardPaymentDescription('')
          }}
          patientId={selectedPatient.id}
          patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
          amount={parseFloat(cardPaymentAmount) || 0}
          description={cardPaymentDescription || `Payment for ${selectedPatient.firstName} ${selectedPatient.lastName}`}
          onSuccess={handleCardPaymentSuccess}
        />
      )}
    </div>
  )
}
