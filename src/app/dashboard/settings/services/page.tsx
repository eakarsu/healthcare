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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  cptCode: string
  name: string
  description: string | null
  category: string
  defaultPrice: number
  duration: number
  isActive: boolean
}

const categories = [
  'OFFICE_VISIT',
  'PREVENTIVE',
  'PROCEDURE',
  'LAB',
  'IMAGING',
  'INJECTION',
  'CONSULTATION',
  'TELEHEALTH',
]

export default function ServicesSettingsPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const [formData, setFormData] = useState({
    cptCode: '',
    name: '',
    description: '',
    category: 'OFFICE_VISIT',
    defaultPrice: '',
    duration: '30',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveService = async () => {
    if (!formData.cptCode || !formData.name || !formData.defaultPrice) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          defaultPrice: parseFloat(formData.defaultPrice),
          duration: parseInt(formData.duration),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Service created',
          description: 'The service has been added successfully.',
        })
        setIsDialogOpen(false)
        setFormData({
          cptCode: '',
          name: '',
          description: '',
          category: 'OFFICE_VISIT',
          defaultPrice: '',
          duration: '30',
        })
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create service',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create service:', error)
      toast({
        title: 'Error',
        description: 'Failed to create service',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const startEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      cptCode: service.cptCode,
      name: service.name,
      description: service.description || '',
      category: service.category,
      defaultPrice: service.defaultPrice.toString(),
      duration: service.duration.toString(),
    })
    setIsDialogOpen(true)
  }

  const updateService = async () => {
    if (!editingService || !formData.cptCode || !formData.name || !formData.defaultPrice) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          defaultPrice: parseFloat(formData.defaultPrice),
          duration: parseInt(formData.duration),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Service updated',
          description: 'The service has been updated successfully.',
        })
        setIsDialogOpen(false)
        setEditingService(null)
        setFormData({ cptCode: '', name: '', description: '', category: 'OFFICE_VISIT', defaultPrice: '', duration: '30' })
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update service',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update service:', error)
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Service deleted',
          description: 'The service has been removed.',
        })
        fetchServices()
        setSelectedService(null)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete service',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      })
    }
  }

  const filteredServices = services.filter((s) => {
    const matchesSearch = !search ||
      s.cptCode.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services & CPT Codes</h1>
          <p className="text-gray-500">Manage medical services and procedures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingService(null);
            setFormData({ cptCode: '', name: '', description: '', category: 'OFFICE_VISIT', defaultPrice: '', duration: '30' });
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              onClick={() => {
                setEditingService(null);
                setFormData({ cptCode: '', name: '', description: '', category: 'OFFICE_VISIT', defaultPrice: '', duration: '30' });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cptCode">CPT Code *</Label>
                  <Input
                    id="cptCode"
                    placeholder="99213"
                    value={formData.cptCode}
                    onChange={(e) => setFormData({ ...formData, cptCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {formatCategory(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="Office Visit - Established Patient"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultPrice">Default Price *</Label>
                  <Input
                    id="defaultPrice"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingService(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={editingService ? updateService : saveService}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by CPT code or name..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {formatCategory(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-300" />
              <p>No services found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CPT Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedService(service)}
                  >
                    <TableCell className="font-mono font-medium">{service.cptCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatCategory(service.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(service.defaultPrice)}
                    </TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEditService(service); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteService(service.id); }}>
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

      {/* Service Detail Dialog */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-teal-50 rounded-lg flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedService.name}</p>
                  <p className="font-mono text-sm text-gray-600">CPT: {selectedService.cptCode}</p>
                </div>
              </div>

              {selectedService.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm">{selectedService.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Category</p>
                  <Badge variant="outline">{formatCategory(selectedService.category)}</Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedService.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {selectedService.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Default Price</p>
                  <p className="text-lg font-semibold text-teal-600">{formatCurrency(selectedService.defaultPrice)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium">{selectedService.duration} minutes</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedService(null)}>
                  Close
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={() => { startEditService(selectedService); setSelectedService(null); }}
                >
                  Edit Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
