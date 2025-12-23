import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateSOAPNote } from '@/lib/ai'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { transcription, patientContext } = await request.json()

    if (!transcription) {
      return apiError('Transcription is required', 400)
    }

    const soapNote = await generateSOAPNote(transcription, patientContext)

    return apiResponse(soapNote)
  } catch (error) {
    console.error('Failed to generate SOAP note:', error)
    return apiError('Failed to generate SOAP note', 500)
  }
}
