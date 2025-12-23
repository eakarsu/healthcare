import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { predictDenialRisk } from '@/lib/ai'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { diagnosis, procedures, insurance, totalCharges, placeOfService } = await request.json()

    if (!diagnosis || !procedures || !insurance) {
      return apiError('Diagnosis, procedures, and insurance are required', 400)
    }

    const prediction = await predictDenialRisk({
      diagnosis,
      procedures,
      insurance,
      totalCharges: totalCharges || 0,
      placeOfService,
    })

    return apiResponse(prediction)
  } catch (error) {
    console.error('Failed to predict denial risk:', error)
    return apiError('Failed to predict denial risk', 500)
  }
}
