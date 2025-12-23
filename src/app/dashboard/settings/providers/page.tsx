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
import { useToast } from '@/components/ui/use-toast'
import { Stethoscope, Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Provider {
  id: string
  npi: string
  specialty: string
  isActive: boolean
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

const specialties = [
  'FAMILY_MEDICINE',
  'INTERNAL_MEDICINE',
  'PEDIATRICS',
  'CARDIOLOGY',
  'DERMATOLOGY',
  'NEUROLOGY',
  'ORTHOPEDICS',
  'PSYCHIATRY',
  'ONCOLOGY',
  'EMERGENCY_MEDICINE',
]

export default function ProvidersSettingsPage() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    npi: '',
    specialty: 'FAMILY_MEDICINE',
  })
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProvider = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.npi) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Provider created',
          description: 'The provider has been added successfully.',
        })
        setIsDialogOpen(false)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          npi: '',
          specialty: 'FAMILY_MEDICINE',
        })
        fetchProviders()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create provider',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to create provider',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const startEditProvider = (provider: Provider) => {
    setEditingProvider(provider)
    setFormData({
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      email: provider.user.email,
      npi: provider.npi,
      specialty: provider.specialty,
    })
    setIsDialogOpen(true)
  }

  const updateProvider = async () => {
    if (!editingProvider || !formData.firstName || !formData.lastName || !formData.npi) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/providers/${editingProvider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Provider updated',
          description: 'The provider has been updated successfully.',
        })
        setIsDialogOpen(false)
        setEditingProvider(null)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          npi: '',
          specialty: 'FAMILY_MEDICINE',
        })
        fetchProviders()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update provider',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to update provider',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/providers/${providerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Provider deleted',
          description: 'The provider has been removed.',
        })
        fetchProviders()
        setSelectedProvider(null)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete provider',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredProviders = providers.filter((p) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      p.user.firstName.toLowerCase().includes(searchLower) ||
      p.user.lastName.toLowerCase().includes(searchLower) ||
      p.npi.includes(search) ||
      p.specialty.toLowerCase().includes(searchLower)
    )
  })

  const formatSpecialty = (specialty: string) => {
    return specialty.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-500">Manage practice providers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProvider(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProvider ? 'Edit Provider' : 'Add New Provider'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npi">NPI Number *</Label>
                <Input
                  id="npi"
                  placeholder="10-digit NPI"
                  value={formData.npi}
                  onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(v) => setFormData({ ...formData, specialty: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatSpecialty(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingProvider(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={editingProvider ? updateProvider : saveProvider}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {saving ? 'Saving...' : editingProvider ? 'Update Provider' : 'Add Provider'}
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
                placeholder="Search providers..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Stethoscope className="mb-4 h-12 w-12 text-gray-300" />
              <p>No providers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>NPI</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow
                    key={provider.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          Dr. {provider.user.firstName} {provider.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{provider.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{provider.npi}</TableCell>
                    <TableCell>{formatSpecialty(provider.specialty)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          provider.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEditProvider(provider); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteProvider(provider.id); }}>
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

      {/* Provider Detail Dialog */}
      <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Dr. {selectedProvider?.user.firstName} {selectedProvider?.user.lastName}
            </DialogTitle>
            <DialogDescription>Provider details</DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-teal-50 rounded-lg flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    Dr. {selectedProvider.user.firstName} {selectedProvider.user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{formatSpecialty(selectedProvider.specialty)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">NPI</p>
                  <p className="font-mono font-medium">{selectedProvider.npi}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedProvider.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {selectedProvider.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{selectedProvider.user.email}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                  Close
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={() => { startEditProvider(selectedProvider); setSelectedProvider(null); }}
                >
                  Edit Provider
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
