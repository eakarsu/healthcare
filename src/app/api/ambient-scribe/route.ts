import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import {
  processAudioChunk,
  diarizeSpeakers,
  generateRealtimeSOAPNote,
  suggestCodesFromSOAP
} from '@/lib/ambient-scribe'

// Start a new ambient session
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { patientId, encounterId, providerId } = await request.json()

    if (!patientId || !providerId) {
      return apiError('Patient ID and Provider ID are required', 400)
    }

    // Create new ambient session
    const ambientSession = await prisma.ambientSession.create({
      data: {
        patientId,
        providerId,
        encounterId,
        status: 'ACTIVE',
        audioChunks: [],
        speakerSegments: [],
        startedAt: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            allergies: { select: { allergen: true } },
            medications: { where: { status: 'active' }, select: { name: true } },
            conditions: { where: { status: 'active' }, select: { name: true } }
          }
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    })

    return apiResponse({
      sessionId: ambientSession.id,
      status: ambientSession.status,
      patient: ambientSession.patient,
      provider: ambientSession.provider,
      startedAt: ambientSession.startedAt
    })
  } catch (error) {
    console.error('Failed to start ambient session:', error)
    return apiError('Failed to start ambient session', 500)
  }
}

// Get active sessions or session by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const providerId = searchParams.get('providerId')

    if (sessionId) {
      const ambientSession = await prisma.ambientSession.findUnique({
        where: { id: sessionId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      if (!ambientSession) {
        return apiError('Session not found', 404)
      }

      return apiResponse(ambientSession)
    }

    // Get active sessions for provider
    const activeSessions = await prisma.ambientSession.findMany({
      where: {
        providerId: providerId || undefined,
        status: 'ACTIVE'
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    return apiResponse(activeSessions)
  } catch (error) {
    console.error('Failed to get ambient sessions:', error)
    return apiError('Failed to get ambient sessions', 500)
  }
}
