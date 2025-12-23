'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Clock } from 'lucide-react'

interface Room {
  id: string
  name: string
  isActive: boolean
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string | null
  isActive: boolean
  rooms: Room[]
}

export default function LocationsSettingsPage() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [roomName, setRoomName] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveLocation = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Location created',
          description: 'The location has been added successfully.',
        })
        setIsDialogOpen(false)
        setFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
        })
        fetchLocations()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create location',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create location:', error)
      toast({
        title: 'Error',
        description: 'Failed to create location',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const startEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone || '',
    })
    setIsDialogOpen(true)
  }

  const updateLocation = async () => {
    if (!editingLocation || !formData.name || !formData.address) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Location updated',
          description: 'The location has been updated successfully.',
        })
        setIsDialogOpen(false)
        setEditingLocation(null)
        setFormData({ name: '', address: '', city: '', state: '', zipCode: '', phone: '' })
        fetchLocations()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update location',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update location:', error)
      toast({
        title: 'Error',
        description: 'Failed to update location',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Location deleted',
          description: 'The location has been removed.',
        })
        fetchLocations()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete location',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete location',
        variant: 'destructive',
      })
    }
  }

  const openAddRoomDialog = (locationId: string) => {
    setSelectedLocationId(locationId)
    setRoomName('')
    setIsRoomDialogOpen(true)
  }

  const addRoom = async () => {
    if (!selectedLocationId || !roomName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room name',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/locations/${selectedLocationId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      })

      if (response.ok) {
        toast({
          title: 'Room added',
          description: 'The room has been added successfully.',
        })
        setIsRoomDialogOpen(false)
        setRoomName('')
        fetchLocations()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add room',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to add room:', error)
      toast({
        title: 'Error',
        description: 'Failed to add room',
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
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500">Manage practice locations and rooms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingLocation(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  placeholder="Main Office"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="TX"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingLocation(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={editingLocation ? updateLocation : saveLocation}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {saving ? 'Saving...' : editingLocation ? 'Update Location' : 'Add Location'}
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
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center text-gray-500">
            <Building2 className="mb-4 h-12 w-12 text-gray-300" />
            <p>No locations configured</p>
            <p className="text-sm">Add your first practice location to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-teal-100 p-2">
                      <Building2 className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <Badge
                        className={
                          location.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditLocation(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteLocation(location.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>{location.address}</p>
                    <p>{location.city}, {location.state} {location.zipCode}</p>
                  </div>
                </div>

                {location.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{location.phone}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Rooms</p>
                    <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => openAddRoomDialog(location.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Room
                    </Button>
                  </div>
                  {location.rooms.length === 0 ? (
                    <p className="text-sm text-gray-500">No rooms configured</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {location.rooms.map((room) => (
                        <Badge
                          key={room.id}
                          variant="outline"
                          className={room.isActive ? '' : 'opacity-50'}
                        >
                          {room.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name *</Label>
              <Input
                id="roomName"
                placeholder="e.g., Exam Room 1"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={addRoom}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
              >
                {saving ? 'Adding...' : 'Add Room'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
