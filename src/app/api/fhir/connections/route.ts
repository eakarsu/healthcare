import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { FHIRClient } from '@/lib/fhir'

// Get all FHIR connections
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) return apiError('Administrative role required', 403)

    const connections = await prisma.fHIRConnection.findMany({
      where: { practiceId: session.user.practiceId },
      include: {
        syncLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Don't expose secrets
    const sanitizedConnections = connections.map(c => ({
      ...c,
      clientSecret: c.clientSecret ? '********' : null,
      accessToken: c.accessToken ? '********' : null
    }))

    return apiResponse(sanitizedConnections)
  } catch (error) {
    console.error('Failed to get FHIR connections:', error)
    return apiError('Failed to get connections', 500)
  }
}

// Create new FHIR connection
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }
    if (session.user.role !== 'ADMIN') return apiError('Administrator role required', 403)

    const body = await request.json()
    const {
      name,
      type,
      baseUrl,
      clientId,
      clientSecret,
      resources,
      autoSync,
      syncInterval
    } = body

    if (!name || !baseUrl) {
      return apiError('Missing required fields', 400)
    }
    const endpoint = new URL(baseUrl)
    const allowedHosts = (process.env.FHIR_ALLOWED_HOSTS || '').split(',').map(value => value.trim()).filter(Boolean)
    if (endpoint.protocol !== 'https:' || !allowedHosts.includes(endpoint.hostname)) return apiError('FHIR endpoint must be HTTPS and present in FHIR_ALLOWED_HOSTS', 400)

    // Test connection
    try {
      const client = new FHIRClient(baseUrl)
      const capability = await client.getCapabilityStatement()

      // Create connection
      const connection = await prisma.fHIRConnection.create({
        data: {
          practiceId: session.user.practiceId,
          name,
          type: type || 'EHR',
          baseUrl,
          clientId,
          clientSecret: clientSecret ? encrypt(clientSecret) : null,
          resources: resources || ['Patient', 'Observation', 'Condition'],
          fhirVersion: capability.fhirVersion || 'R4',
          capabilities: capability,
          autoSync: autoSync || false,
          syncInterval: syncInterval || 60,
          status: 'active'
        }
      })

      // Log successful connection
      await prisma.fHIRSyncLog.create({
        data: {
          connectionId: connection.id,
          direction: 'outbound',
          resourceType: 'CapabilityStatement',
          operation: 'read',
          status: 'success',
          responseData: capability
        }
      })

      return apiResponse({
        ...connection,
        clientSecret: connection.clientSecret ? '********' : null
      }, 201)
    } catch (connError) {
      return apiError(`Connection test failed: ${(connError as Error).message}`, 400)
    }
  } catch (error) {
    console.error('Failed to create FHIR connection:', error)
    return apiError('Failed to create connection', 500)
  }
}
