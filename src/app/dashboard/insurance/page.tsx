'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Building2, Plus, Search, Edit, Trash2, Shield, Phone } from 'lucide-react'

interface InsurancePlan {
  id: string
  payerId: string
  payerName: string
  name: string
  planType: string
  phone: string | null
  isActive: boolean
  _count?: {
    patientInsurances: number
  }
}

export default function InsurancePage() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    payerId: '',
    payerName: '',
    name: '',
    planType: 'PPO',
    phone: '',
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/insurance-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch insurance plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditPlan = (plan: InsurancePlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPlanId(plan.id)
    setFormData({
      payerId: plan.payerId,
      payerName: plan.payerName,
      name: plan.name,
      planType: plan.planType,
      phone: plan.phone || '',
    })
    setIsDialogOpen(true)
  }

  const savePlan = async () => {
    if (!formData.payerId || !formData.payerName || !formData.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const isEditing = !!editingPlanId
      const url = isEditing ? `/api/insurance-plans/${editingPlanId}` : '/api/insurance-plans'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: isEditing ? 'Insurance plan updated' : 'Insurance plan created',
          description: isEditing
            ? 'The insurance plan has been updated successfully.'
            : 'The insurance plan has been added successfully.',
        })
        setIsDialogOpen(false)
        setEditingPlanId(null)
        setFormData({
          payerId: '',
          payerName: '',
          name: '',
          planType: 'PPO',
          phone: '',
        })
        fetchPlans()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || `Failed to ${isEditing ? 'update' : 'create'} insurance plan`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to save insurance plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to save insurance plan',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this insurance plan?')) {
      return
    }

    try {
      const response = await fetch(`/api/insurance-plans/${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Insurance plan deleted',
          description: 'The insurance plan has been deleted.',
        })
        fetchPlans()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete insurance plan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete insurance plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete insurance plan',
        variant: 'destructive',
      })
    }
  }

  const filteredPlans = plans.filter((p) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      p.payerName.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.payerId.toLowerCase().includes(searchLower)
    )
  })

  const getPlanTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PPO: 'bg-blue-100 text-blue-800',
      HMO: 'bg-green-100 text-green-800',
      EPO: 'bg-purple-100 text-purple-800',
      POS: 'bg-orange-100 text-orange-800',
      HDHP: 'bg-yellow-100 text-yellow-800',
      MEDICARE: 'bg-red-100 text-red-800',
      MEDICAID: 'bg-teal-100 text-teal-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Plans</h1>
          <p className="text-gray-500">Manage insurance payers and plans</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing/eligibility">
              <Shield className="mr-2 h-4 w-4" />
              Verify Eligibility
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingPlanId(null)
              setFormData({
                payerId: '',
                payerName: '',
                name: '',
                planType: 'PPO',
                phone: '',
              })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Insurance Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlanId ? 'Edit Insurance Plan' : 'Add Insurance Plan'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payerName">Payer Name *</Label>
                  <Input
                    id="payerName"
                    placeholder="e.g., Blue Cross Blue Shield"
                    value={formData.payerName}
                    onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payerId">Payer ID *</Label>
                    <Input
                      id="payerId"
                      placeholder="e.g., 00050"
                      value={formData.payerId}
                      onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <select
                      id="planType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    >
                      <option value="PPO">PPO</option>
                      <option value="HMO">HMO</option>
                      <option value="EPO">EPO</option>
                      <option value="POS">POS</option>
                      <option value="HDHP">HDHP</option>
                      <option value="MEDICARE">Medicare</option>
                      <option value="MEDICAID">Medicaid</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Choice PPO"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(800) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={savePlan}
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  >
                    {saving ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Add Plan'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by payer name, plan name, or payer ID..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Building2 className="mb-4 h-12 w-12 text-gray-300" />
              <p>No insurance plans found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payer</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Payer ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <TableCell className="font-medium">{plan.payerName}</TableCell>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell className="font-mono">{plan.payerId}</TableCell>
                    <TableCell>
                      <Badge className={getPlanTypeColor(plan.planType)}>{plan.planType}</Badge>
                    </TableCell>
                    <TableCell>
                      {plan.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {plan.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{plan._count?.patientInsurances || 0}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          plan.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => startEditPlan(plan, e)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => handleDeletePlan(plan.id, e)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Plan Detail Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedPlan?.payerName}</DialogTitle>
              {selectedPlan && (
                <Badge className={getPlanTypeColor(selectedPlan.planType)}>{selectedPlan.planType}</Badge>
              )}
            </div>
            <DialogDescription>Insurance plan details</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Plan Name</p>
                <p className="text-lg font-semibold">{selectedPlan.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payer ID</p>
                  <p className="font-mono font-medium">{selectedPlan.payerId}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Enrolled Patients</p>
                  <p className="font-medium">{selectedPlan._count?.patientInsurances || 0}</p>
                </div>
              </div>

              {selectedPlan.phone && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{selectedPlan.phone}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <Badge
                  className={
                    selectedPlan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {selectedPlan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                  Close
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={() => {
                    if (selectedPlan) {
                      setEditingPlanId(selectedPlan.id)
                      setFormData({
                        payerId: selectedPlan.payerId,
                        payerName: selectedPlan.payerName,
                        name: selectedPlan.name,
                        planType: selectedPlan.planType,
                        phone: selectedPlan.phone || '',
                      })
                      setSelectedPlan(null)
                      setIsDialogOpen(true)
                    }
                  }}
                >
                  Edit Plan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
