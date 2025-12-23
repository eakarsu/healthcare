'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface LabOrder {
  id: string
  orderNumber: string
  status: string
  labName: string
  specimenType: string
  testCodes: string[]
  priority: string
  orderedAt: string
  resultsReceivedAt: string | null
  reviewedAt: string | null
  patient: { firstName: string; lastName: string }
  orderedBy: { firstName: string; lastName: string }
}

export default function LabOrdersPage() {
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/lab-orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch lab orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lab-orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchOrders()
        setStatusDialogOpen(false)
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SPECIMEN_COLLECTED: 'bg-blue-100 text-blue-800',
      SENT_TO_LAB: 'bg-indigo-100 text-indigo-800',
      RESULTS_RECEIVED: 'bg-purple-100 text-purple-800',
      REVIEWED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'REVIEWED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      STAT: 'bg-red-100 text-red-800',
      URGENT: 'bg-orange-100 text-orange-800',
      ROUTINE: 'bg-gray-100 text-gray-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      PENDING: 'SPECIMEN_COLLECTED',
      SPECIMEN_COLLECTED: 'SENT_TO_LAB',
      SENT_TO_LAB: 'RESULTS_RECEIVED',
      RESULTS_RECEIVED: 'REVIEWED',
      REVIEWED: 'COMPLETED',
    }
    return flow[current] || null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Orders</h1>
          <p className="text-gray-500">Track and manage laboratory orders</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => setNewOrderOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Lab Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FlaskConical className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => ['SPECIMEN_COLLECTED', 'SENT_TO_LAB'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Awaiting Review</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === 'RESULTS_RECEIVED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by order number or patient..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SPECIMEN_COLLECTED">Specimen Collected</SelectItem>
                <SelectItem value="SENT_TO_LAB">Sent to Lab</SelectItem>
                <SelectItem value="RESULTS_RECEIVED">Results Received</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <FlaskConical className="mb-4 h-12 w-12 text-gray-300" />
              <p>No lab orders found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedOrder(order)
                        setDetailOpen(true)
                      }}
                    >
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.patient.lastName}, {order.patient.firstName}
                      </TableCell>
                      <TableCell>{order.labName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {order.testCodes.slice(0, 2).map((code) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                          {order.testCodes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{order.testCodes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(order.orderedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {getNextStatus(order.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setStatusDialogOpen(true)
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
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

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lab Order Status</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center gap-4">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.replace(/_/g, ' ')}
                </Badge>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <Badge className={getStatusColor(getNextStatus(selectedOrder.status) || '')}>
                  {getNextStatus(selectedOrder.status)?.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    const next = getNextStatus(selectedOrder.status)
                    if (next) updateStatus(selectedOrder.id, next)
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lab Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-600" />
              {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Lab order details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Status and Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <Badge className={getPriorityColor(selectedOrder.priority)}>
                  {selectedOrder.priority}
                </Badge>
              </div>

              {/* Patient & Lab Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-medium">
                    {selectedOrder.patient.lastName}, {selectedOrder.patient.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lab</p>
                  <p className="font-medium">{selectedOrder.labName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ordered By</p>
                  <p className="font-medium">
                    {selectedOrder.orderedBy?.firstName} {selectedOrder.orderedBy?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.orderedAt)}</p>
                </div>
              </div>

              {/* Tests */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tests Ordered</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.testCodes.map((code) => (
                    <Badge key={code} variant="outline">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Results Info */}
              {selectedOrder.resultsReceivedAt && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Results received:</strong> {formatDate(selectedOrder.resultsReceivedAt)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailOpen(false)}
                >
                  Close
                </Button>
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      setDetailOpen(false)
                      setStatusDialogOpen(true)
                    }}
                  >
                    Update Status
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
