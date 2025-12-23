'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Building2,
} from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface Statement {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate?: string
}

interface PaymentHistory {
  id: string
  date: string
  amount: number
  method: string
  reference: string
  description: string
}

export default function PortalPaymentsPage() {
  const { toast } = useToast()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)

  // Mock data
  const accountBalance = 125.50
  const insurancePending = 450.00

  const statements: Statement[] = [
    {
      id: '1',
      date: '2024-11-15',
      description: 'Office Visit - Dr. Wilson',
      amount: 125.50,
      status: 'pending',
      dueDate: '2024-12-15',
    },
    {
      id: '2',
      date: '2024-10-20',
      description: 'Lab Work - Blood Panel',
      amount: 85.00,
      status: 'paid',
    },
    {
      id: '3',
      date: '2024-09-10',
      description: 'Annual Physical',
      amount: 0,
      status: 'paid',
    },
  ]

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '2024-10-25',
      amount: 85.00,
      method: 'Credit Card',
      reference: 'PAY-2024-1025-001',
      description: 'Lab Work Payment',
    },
    {
      id: '2',
      date: '2024-08-15',
      amount: 150.00,
      method: 'Credit Card',
      reference: 'PAY-2024-0815-001',
      description: 'Follow-up Visit Payment',
    },
    {
      id: '3',
      date: '2024-06-20',
      amount: 50.00,
      method: 'Bank Account',
      reference: 'PAY-2024-0620-001',
      description: 'Copay Payment',
    },
  ]

  const handlePayment = async () => {
    if (!paymentAmount || !paymentMethod) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast({
      title: 'Payment successful',
      description: `Your payment of ${formatCurrency(parseFloat(paymentAmount))} has been processed.`,
    })
    setIsPaymentDialogOpen(false)
    setPaymentAmount('')
    setPaymentMethod('')
    setProcessing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Billing</h1>
          <p className="text-gray-500">View and pay your medical bills</p>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={accountBalance > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`text-3xl font-bold ${accountBalance > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {formatCurrency(accountBalance)}
                </p>
              </div>
              <DollarSign className={`h-10 w-10 ${accountBalance > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
            </div>
            {accountBalance > 0 && (
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                    Pay Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Make a Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(accountBalance)}</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentAmount(accountBalance.toString())}
                        >
                          Pay Full Balance
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentAmount('50')}
                        >
                          $50
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentAmount('100')}
                        >
                          $100
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card-ending-4242">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Visa ending in 4242
                            </div>
                          </SelectItem>
                          <SelectItem value="card-ending-1234">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Mastercard ending in 1234
                            </div>
                          </SelectItem>
                          <SelectItem value="new-card">Add New Card</SelectItem>
                          <SelectItem value="bank">Bank Account (ACH)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={processing}
                        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                      >
                        {processing ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          `Pay ${paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : '$0.00'}`
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insurance Pending</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(insurancePending)}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting insurance processing</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Year-to-Date Paid</p>
                <p className="text-3xl font-bold text-gray-700">{formatCurrency(285.00)}</p>
                <p className="text-xs text-gray-500 mt-1">3 payments made</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-600" />
                Recent Statements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statements.map((statement) => (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-600">
                        <span className="text-sm font-bold">
                          {format(new Date(statement.date), 'd')}
                        </span>
                        <span className="text-xs">
                          {format(new Date(statement.date), 'MMM')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{statement.description}</p>
                        {statement.dueDate && statement.status === 'pending' && (
                          <p className="text-sm text-gray-500">
                            Due: {format(new Date(statement.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(statement.amount)}</p>
                        {getStatusBadge(statement.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-green-100 p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.date), 'MMM d, yyyy')} • {payment.method}
                        </p>
                        <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        -{formatCurrency(payment.amount)}
                      </p>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Saved Payment Methods
                </CardTitle>
                <Button variant="outline" size="sm">
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Default</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Mastercard ending in 1234</p>
                      <p className="text-sm text-gray-500">Expires 08/26</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Set Default</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Assistance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Need Payment Assistance?</h3>
              <p className="text-sm text-blue-700 mt-1">
                We offer flexible payment plans for balances over $200. Contact our billing
                department at (555) 123-4567 or send a message through the portal to discuss
                your options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
