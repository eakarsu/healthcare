import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { searchPharmacies, getPharmacy } from '@/lib/drfirst/pharmacy-search'
import { isConfigured } from '@/lib/drfirst/client'

/**
 * GET /api/eprescribe/pharmacies/search - Search pharmacies
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)

    // If NCPDP ID provided, get specific pharmacy
    const ncpdpId = searchParams.get('ncpdpId')
    if (ncpdpId) {
      const pharmacy = await getPharmacy(ncpdpId)
      if (!pharmacy) {
        return apiError('Pharmacy not found', 404)
      }
      return apiResponse({ pharmacy, isRealData: isConfigured() })
    }

    // Search pharmacies
    const params = {
      zipCode: searchParams.get('zipCode') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      name: searchParams.get('name') || undefined,
      latitude: searchParams.get('latitude')
        ? parseFloat(searchParams.get('latitude')!)
        : undefined,
      longitude: searchParams.get('longitude')
        ? parseFloat(searchParams.get('longitude')!)
        : undefined,
      radius: searchParams.get('radius')
        ? parseInt(searchParams.get('radius')!)
        : 10,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
    }

    // Require at least one search parameter
    if (!params.zipCode && !params.city && !params.name && !params.latitude) {
      return apiError('At least one search parameter (zipCode, city, name, or coordinates) is required', 400)
    }

    const pharmacies = await searchPharmacies(params)

    return apiResponse({
      pharmacies,
      count: pharmacies.length,
      searchParams: params,
      isRealData: isConfigured(),
    })
  } catch (error) {
    console.error('Failed to search pharmacies:', error)
    return apiError('Failed to search pharmacies', 500)
  }
}
