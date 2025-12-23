import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { transmitPrescription, searchPharmacies } from '@/lib/prescribing'

// Get single prescription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            dateOfBirth: true,
            address: true,
            city: true,
            state: true,
            zip: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        encounter: {
          select: { id: true, encounterNumber: true }
        },
        renewals: {
          orderBy: { requestDate: 'desc' }
        },
        fills: {
          orderBy: { fillDate: 'desc' }
        }
      }
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    return apiResponse(prescription)
  } catch (error) {
    console.error('Failed to get prescription:', error)
    return apiError('Failed to get prescription', 500)
  }
}

// Update prescription
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

    const prescription = await prisma.prescription.findUnique({
      where: { id }
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    // Don't allow editing sent prescriptions
    if (['SENT', 'RECEIVED', 'FILLED'].includes(prescription.status)) {
      return apiError('Cannot modify prescription after it has been sent', 400)
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: body
    })

    return apiResponse(updated)
  } catch (error) {
    console.error('Failed to update prescription:', error)
    return apiError('Failed to update prescription', 500)
  }
}

// Delete/Cancel prescription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const { id } = await params

    const prescription = await prisma.prescription.findUnique({
      where: { id }
    })

    if (!prescription) {
      return apiError('Prescription not found', 404)
    }

    // If already sent, cancel instead of delete
    if (['SENT', 'RECEIVED', 'FILLED'].includes(prescription.status)) {
      await prisma.prescription.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })
      return apiResponse({ success: true, action: 'cancelled' })
    }

    await prisma.prescription.delete({
      where: { id }
    })

    return apiResponse({ success: true, action: 'deleted' })
  } catch (error) {
    console.error('Failed to delete prescription:', error)
    return apiError('Failed to delete prescription', 500)
  }
}
