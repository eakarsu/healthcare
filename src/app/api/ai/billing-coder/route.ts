import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { suggestBillingCodes } from '@/lib/ai'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { clinicalNote } = await request.json()

    if (!clinicalNote) {
      return apiError('Clinical note is required', 400)
    }

    const suggestions = await suggestBillingCodes(clinicalNote)

    return apiResponse(suggestions)
  } catch (error) {
    console.error('Failed to suggest billing codes:', error)
    return apiError('Failed to suggest billing codes', 500)
  }
}
