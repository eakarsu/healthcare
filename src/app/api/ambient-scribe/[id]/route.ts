import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import {
  diarizeSpeakers,
  generateRealtimeSOAPNote,
  suggestCodesFromSOAP
} from '@/lib/ambient-scribe'

// Update session with transcription or audio chunk
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const body = await request.json()
    const { action, data } = body

    const ambientSession = await prisma.ambientSession.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            allergies: { select: { allergen: true } },
            medications: { where: { status: 'active' }, select: { name: true } },
            conditions: { where: { status: 'active' }, select: { name: true } }
          }
        }
      }
    })

    if (!ambientSession) {
      return apiError('Session not found', 404)
    }

    switch (action) {
      case 'ADD_TRANSCRIPTION': {
        // Append transcription text
        const currentTranscript = ambientSession.liveTranscript || ''
        const newTranscript = currentTranscript + (currentTranscript ? ' ' : '') + data.text

        // Perform speaker diarization
        const speakerSegments = await diarizeSpeakers(newTranscript)

        const updated = await prisma.ambientSession.update({
          where: { id },
          data: {
            liveTranscript: newTranscript,
            speakerSegments: speakerSegments as unknown as Parameters<typeof prisma.ambientSession.update>[0]['data']['speakerSegments']
          }
        })

        return apiResponse({
          transcript: updated.liveTranscript,
          speakerSegments: updated.speakerSegments
        })
      }

      case 'GENERATE_SOAP': {
        // Generate SOAP note from transcript
        const transcript = ambientSession.liveTranscript
        if (!transcript) {
          return apiError('No transcript available', 400)
        }

        const speakerSegments = (ambientSession.speakerSegments as Array<{
          speaker: 'PROVIDER' | 'PATIENT' | 'UNKNOWN'
          text: string
          startTime: number
          endTime: number
          confidence: number
        }>) || []

        const patientContext = {
          allergies: ambientSession.patient.allergies.map(a => a.allergen),
          medications: ambientSession.patient.medications.map(m => m.name),
          conditions: ambientSession.patient.conditions.map(c => c.name)
        }

        const soapNote = await generateRealtimeSOAPNote(speakerSegments, patientContext)

        const updated = await prisma.ambientSession.update({
          where: { id },
          data: {
            draftSoapNote: soapNote
          }
        })

        return apiResponse({
          soapNote: updated.draftSoapNote
        })
      }

      case 'SUGGEST_CODES': {
        // Generate billing code suggestions
        const soapNote = ambientSession.draftSoapNote as {
          chiefComplaint: string
          subjective: string
          objective: string
          assessment: string
          plan: string
        } | null

        if (!soapNote) {
          return apiError('Generate SOAP note first', 400)
        }

        const codes = await suggestCodesFromSOAP(soapNote)

        const updated = await prisma.ambientSession.update({
          where: { id },
          data: {
            suggestedCodes: codes
          }
        })

        return apiResponse({
          suggestedCodes: updated.suggestedCodes
        })
      }

      case 'PAUSE': {
        const updated = await prisma.ambientSession.update({
          where: { id },
          data: { status: 'PAUSED' }
        })
        return apiResponse({ status: updated.status })
      }

      case 'RESUME': {
        const updated = await prisma.ambientSession.update({
          where: { id },
          data: { status: 'ACTIVE' }
        })
        return apiResponse({ status: updated.status })
      }

      case 'COMPLETE': {
        const updated = await prisma.ambientSession.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            endedAt: new Date()
          }
        })
        return apiResponse({
          status: updated.status,
          endedAt: updated.endedAt
        })
      }

      default:
        return apiError('Invalid action', 400)
    }
  } catch (error) {
    console.error('Failed to update ambient session:', error)
    return apiError('Failed to update ambient session', 500)
  }
}

// Apply session data to encounter
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params
    const { encounterId } = await request.json()

    const ambientSession = await prisma.ambientSession.findUnique({
      where: { id }
    })

    if (!ambientSession) {
      return apiError('Session not found', 404)
    }

    const soapNote = ambientSession.draftSoapNote as {
      chiefComplaint: string
      subjective: string
      objective: string
      assessment: string
      plan: string
    } | null

    if (!soapNote) {
      return apiError('No SOAP note generated', 400)
    }

    // Update encounter with SOAP note data
    const encounter = await prisma.encounter.update({
      where: { id: encounterId },
      data: {
        chiefComplaint: soapNote.chiefComplaint,
        subjective: soapNote.subjective,
        objective: soapNote.objective,
        assessment: soapNote.assessment,
        plan: soapNote.plan,
        transcription: ambientSession.liveTranscript,
        aiDraftNote: JSON.stringify(soapNote)
      }
    })

    // Link session to encounter
    await prisma.ambientSession.update({
      where: { id },
      data: { encounterId }
    })

    return apiResponse({
      success: true,
      encounterId: encounter.id
    })
  } catch (error) {
    console.error('Failed to apply ambient session to encounter:', error)
    return apiError('Failed to apply session to encounter', 500)
  }
}
