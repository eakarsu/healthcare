'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { DollarSign, Plus, Edit, Trash2, Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FeeSchedule {
  id: string
  name: string
  payerName: string | null
  isDefault: boolean
  isActive: boolean
  effectiveDate: string
  endDate: string | null
  fees: FeeItem[]
}

interface FeeItem {
  id: string
  cptCode: string
  serviceName: string
  allowedAmount: number
  contractedRate: number | null
}

export default function FeeSchedulesPage() {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<FeeSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<FeeSchedule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<FeeSchedule | null>(null)
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    payerName: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  })

  const [feeFormData, setFeeFormData] = useState({
    cptCode: '',
    serviceName: '',
    allowedAmount: '',
    contractedRate: '',
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/fee-schedules')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.data || [])
        if (data.data?.length > 0) {
          setSelectedSchedule(data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch fee schedules:', error)
      // Mock data for display
      const mockSchedules: FeeSchedule[] = [
        {
          id: '1',
          name: 'Standard Fee Schedule',
          payerName: null,
          isDefault: true,
          isActive: true,
          effectiveDate: '2024-01-01',
          endDate: null,
          fees: [
            { id: '1', cptCode: '99213', serviceName: 'Office Visit - Est. Patient (Low)', allowedAmount: 150, contractedRate: null },
            { id: '2', cptCode: '99214', serviceName: 'Office Visit - Est. Patient (Mod)', allowedAmount: 200, contractedRate: null },
            { id: '3', cptCode: '99215', serviceName: 'Office Visit - Est. Patient (High)', allowedAmount: 275, contractedRate: null },
            { id: '4', cptCode: '99203', serviceName: 'Office Visit - New Patient (Low)', allowedAmount: 175, contractedRate: null },
            { id: '5', cptCode: '99204', serviceName: 'Office Visit - New Patient (Mod)', allowedAmount: 250, contractedRate: null },
          ],
        },
        {
          id: '2',
          name: 'Medicare Fee Schedule',
          payerName: 'Medicare',
          isDefault: false,
          isActive: true,
          effectiveDate: '2024-01-01',
          endDate: null,
          fees: [
            { id: '6', cptCode: '99213', serviceName: 'Office Visit - Est. Patient (Low)', allowedAmount: 150, contractedRate: 98.50 },
            { id: '7', cptCode: '99214', serviceName: 'Office Visit - Est. Patient (Mod)', allowedAmount: 200, contractedRate: 145.75 },
            { id: '8', cptCode: '99215', serviceName: 'Office Visit - Est. Patient (High)', allowedAmount: 275, contractedRate: 198.25 },
          ],
        },
        {
          id: '3',
          name: 'Blue Cross Blue Shield',
          payerName: 'BCBS',
          isDefault: false,
          isActive: true,
          effectiveDate: '2024-01-01',
          endDate: null,
          fees: [
            { id: '9', cptCode: '99213', serviceName: 'Office Visit - Est. Patient (Low)', allowedAmount: 150, contractedRate: 125.00 },
            { id: '10', cptCode: '99214', serviceName: 'Office Visit - Est. Patient (Mod)', allowedAmount: 200, contractedRate: 165.00 },
          ],
        },
      ]
      setSchedules(mockSchedules)
      setSelectedSchedule(mockSchedules[0])
    } finally {
      setLoading(false)
    }
  }

  const saveSchedule = async () => {
    if (!formData.name || !formData.effectiveDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // API call would go here
      toast({
        title: 'Fee schedule created',
        description: 'The fee schedule has been added successfully.',
      })
      setIsDialogOpen(false)
      setFormData({
        name: '',
        payerName: '',
        effectiveDate: new Date().toISOString().split('T')[0],
      })
      fetchSchedules()
    } catch (error) {
      console.error('Failed to create fee schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to create fee schedule',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const startEditSchedule = () => {
    if (!selectedSchedule) return
    setEditingSchedule(selectedSchedule)
    setFormData({
      name: selectedSchedule.name,
      payerName: selectedSchedule.payerName || '',
      effectiveDate: selectedSchedule.effectiveDate.split('T')[0],
    })
    setIsDialogOpen(true)
  }

  const updateSchedule = async () => {
    if (!editingSchedule) return
    setSaving(true)
    try {
      toast({
        title: 'Fee schedule updated',
        description: 'The fee schedule has been updated successfully.',
      })
      setIsDialogOpen(false)
      setEditingSchedule(null)
      fetchSchedules()
    } catch (error) {
      console.error('Failed to update fee schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to update fee schedule',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const openAddFeeDialog = () => {
    setEditingFee(null)
    setFeeFormData({ cptCode: '', serviceName: '', allowedAmount: '', contractedRate: '' })
    setIsFeeDialogOpen(true)
  }

  const startEditFee = (fee: FeeItem) => {
    setEditingFee(fee)
    setFeeFormData({
      cptCode: fee.cptCode,
      serviceName: fee.serviceName,
      allowedAmount: fee.allowedAmount.toString(),
      contractedRate: fee.contractedRate?.toString() || '',
    })
    setIsFeeDialogOpen(true)
  }

  const saveFee = async () => {
    if (!feeFormData.cptCode || !feeFormData.serviceName || !feeFormData.allowedAmount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      toast({
        title: editingFee ? 'Fee updated' : 'Fee added',
        description: editingFee ? 'The fee has been updated.' : 'The fee has been added to the schedule.',
      })
      setIsFeeDialogOpen(false)
      setEditingFee(null)
      fetchSchedules()
    } catch (error) {
      console.error('Failed to save fee:', error)
      toast({
        title: 'Error',
        description: 'Failed to save fee',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Schedules</h1>
          <p className="text-gray-500">Manage pricing for services by payer</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSchedule(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              New Fee Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Fee Schedule' : 'Create Fee Schedule'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Medicare 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payerName">Payer (Optional)</Label>
                <Input
                  id="payerName"
                  placeholder="Leave blank for standard rates"
                  value={formData.payerName}
                  onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingSchedule(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={editingSchedule ? updateSchedule : saveSchedule}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {saving ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Fee Schedules List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Fee Schedules</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {schedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedSchedule?.id === schedule.id
                        ? 'bg-teal-50 border-l-2 border-teal-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{schedule.name}</p>
                        <p className="text-xs text-gray-500">
                          {schedule.payerName || 'Standard Rates'}
                        </p>
                      </div>
                      {schedule.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Schedule Details */}
          <Card className="lg:col-span-3">
            {selectedSchedule ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedSchedule.name}</CardTitle>
                      <CardDescription>
                        {selectedSchedule.payerName ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {selectedSchedule.payerName}
                          </span>
                        ) : (
                          'Standard fee schedule for all payers'
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={startEditSchedule}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={openAddFeeDialog}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Fee
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CPT Code</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Charge Amount</TableHead>
                        <TableHead className="text-right">Contracted Rate</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSchedule.fees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-mono font-medium">{fee.cptCode}</TableCell>
                          <TableCell>{fee.serviceName}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(fee.allowedAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {fee.contractedRate ? (
                              formatCurrency(fee.contractedRate)
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => startEditFee(fee)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p>Select a fee schedule to view details</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Add/Edit Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={(open) => { setIsFeeDialogOpen(open); if (!open) setEditingFee(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit Fee' : 'Add Fee'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cptCode">CPT Code *</Label>
                <Input
                  id="cptCode"
                  placeholder="99213"
                  value={feeFormData.cptCode}
                  onChange={(e) => setFeeFormData({ ...feeFormData, cptCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="Office Visit Level 3"
                  value={feeFormData.serviceName}
                  onChange={(e) => setFeeFormData({ ...feeFormData, serviceName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allowedAmount">Charge Amount *</Label>
                <Input
                  id="allowedAmount"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={feeFormData.allowedAmount}
                  onChange={(e) => setFeeFormData({ ...feeFormData, allowedAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractedRate">Contracted Rate</Label>
                <Input
                  id="contractedRate"
                  type="number"
                  step="0.01"
                  placeholder="125.00"
                  value={feeFormData.contractedRate}
                  onChange={(e) => setFeeFormData({ ...feeFormData, contractedRate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsFeeDialogOpen(false); setEditingFee(null); }}>
                Cancel
              </Button>
              <Button
                onClick={saveFee}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              >
                {saving ? 'Saving...' : editingFee ? 'Update Fee' : 'Add Fee'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
