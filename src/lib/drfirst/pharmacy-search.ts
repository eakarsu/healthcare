import { getClient, isConfigured } from './client'

export interface Pharmacy {
  ncpdpId: string
  npi?: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax?: string
  specialties?: string[]
  services?: string[]
  hours?: string
  distance?: number
  isMailOrder?: boolean
  is24Hour?: boolean
  acceptsElectronicRx?: boolean
  acceptsControlledSubstances?: boolean
}

export interface PharmacySearchParams {
  zipCode?: string
  city?: string
  state?: string
  name?: string
  latitude?: number
  longitude?: number
  radius?: number // in miles
  limit?: number
}

/**
 * Search pharmacies via Surescripts directory
 */
export async function searchPharmacies(
  params: PharmacySearchParams
): Promise<Pharmacy[]> {
  if (!isConfigured()) {
    // Return mock pharmacies for development
    return getMockPharmacies(params)
  }

  try {
    const client = await getClient()

    const response = await client.get('/pharmacy/search', {
      params: {
        zipCode: params.zipCode,
        city: params.city,
        state: params.state,
        name: params.name,
        latitude: params.latitude,
        longitude: params.longitude,
        radiusMiles: params.radius || 10,
        limit: params.limit || 20,
      },
    })

    return response.data.pharmacies.map(mapPharmacy)
  } catch (error) {
    console.error('Failed to search pharmacies:', error)
    throw new Error('Failed to search pharmacies')
  }
}

/**
 * Get pharmacy by NCPDP ID
 */
export async function getPharmacy(ncpdpId: string): Promise<Pharmacy | null> {
  if (!isConfigured()) {
    // Return mock pharmacy for development
    const mockPharmacies = getMockPharmacies({})
    return mockPharmacies.find((p) => p.ncpdpId === ncpdpId) || mockPharmacies[0]
  }

  try {
    const client = await getClient()

    const response = await client.get(`/pharmacy/${ncpdpId}`)
    return mapPharmacy(response.data)
  } catch (error) {
    console.error('Failed to get pharmacy:', error)
    return null
  }
}

/**
 * Map API response to Pharmacy interface
 */
function mapPharmacy(data: Record<string, unknown>): Pharmacy {
  return {
    ncpdpId: (data.ncpdpId || data.NCPDPID || '') as string,
    npi: (data.npi || data.NPI) as string | undefined,
    name: (data.name || data.StoreName || '') as string,
    address: (data.address || data.Address1 || '') as string,
    city: (data.city || data.City || '') as string,
    state: (data.state || data.State || '') as string,
    zip: (data.zip || data.ZipCode || '') as string,
    phone: (data.phone || data.PhoneNumber || '') as string,
    fax: (data.fax || data.FaxNumber) as string | undefined,
    specialties: data.specialties as string[] | undefined,
    services: data.services as string[] | undefined,
    hours: data.hours as string | undefined,
    distance: data.distance as number | undefined,
    isMailOrder: data.isMailOrder as boolean | undefined,
    is24Hour: data.is24Hour as boolean | undefined,
    acceptsElectronicRx: (data.acceptsElectronicRx ?? true) as boolean,
    acceptsControlledSubstances: data.acceptsControlledSubstances as boolean | undefined,
  }
}

/**
 * Get mock pharmacies for development
 */
function getMockPharmacies(params: PharmacySearchParams): Pharmacy[] {
  const mockPharmacies: Pharmacy[] = [
    {
      ncpdpId: '0123456',
      npi: '1234567890',
      name: 'CVS Pharmacy #1234',
      address: '123 Main Street',
      city: params.city || 'New York',
      state: params.state || 'NY',
      zip: params.zipCode || '10001',
      phone: '(212) 555-1234',
      fax: '(212) 555-1235',
      specialties: ['Retail'],
      services: ['Drive-thru', 'Immunizations', 'MTM'],
      hours: 'Mon-Fri: 8am-9pm, Sat-Sun: 9am-6pm',
      distance: 0.5,
      acceptsElectronicRx: true,
      acceptsControlledSubstances: true,
    },
    {
      ncpdpId: '0123457',
      npi: '1234567891',
      name: 'Walgreens #5678',
      address: '456 Broadway',
      city: params.city || 'New York',
      state: params.state || 'NY',
      zip: params.zipCode || '10002',
      phone: '(212) 555-5678',
      fax: '(212) 555-5679',
      specialties: ['Retail'],
      services: ['24-hour', 'Drive-thru', 'Immunizations'],
      hours: 'Open 24 hours',
      distance: 0.8,
      is24Hour: true,
      acceptsElectronicRx: true,
      acceptsControlledSubstances: true,
    },
    {
      ncpdpId: '0123458',
      npi: '1234567892',
      name: 'Express Scripts Mail Pharmacy',
      address: 'PO Box 21234',
      city: 'St. Louis',
      state: 'MO',
      zip: '63102',
      phone: '1-800-555-0000',
      specialties: ['Mail Order'],
      isMailOrder: true,
      acceptsElectronicRx: true,
      acceptsControlledSubstances: false,
    },
    {
      ncpdpId: '0123459',
      npi: '1234567893',
      name: 'Community Pharmacy',
      address: '789 Oak Avenue',
      city: params.city || 'New York',
      state: params.state || 'NY',
      zip: params.zipCode || '10003',
      phone: '(212) 555-7890',
      fax: '(212) 555-7891',
      specialties: ['Retail', 'Compounding'],
      services: ['Compounding', 'Immunizations', 'MTM', 'Delivery'],
      hours: 'Mon-Fri: 9am-7pm, Sat: 9am-5pm, Sun: Closed',
      distance: 1.2,
      acceptsElectronicRx: true,
      acceptsControlledSubstances: true,
    },
  ]

  // Filter by name if provided
  if (params.name) {
    const searchName = params.name.toLowerCase()
    return mockPharmacies.filter((p) =>
      p.name.toLowerCase().includes(searchName)
    )
  }

  return mockPharmacies.slice(0, params.limit || 20)
}
