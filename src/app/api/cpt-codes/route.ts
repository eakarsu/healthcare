import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return apiError('Unauthorized', 401)
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const excludeExisting = url.searchParams.get('excludeExisting') === 'true'

    // Get existing service codes for this practice
    const existingServices = await prisma.service.findMany({
      where: { practiceId: session.user.practiceId },
      select: { code: true },
    })
    const existingCodes = new Set(existingServices.map((s) => s.code))

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const cptCodes = await prisma.cPTCode.findMany({
      where,
      orderBy: { code: 'asc' },
      take: 100,
    })

    // Filter out codes already in use if requested
    const filteredCodes = excludeExisting
      ? cptCodes.filter((cpt) => !existingCodes.has(cpt.code))
      : cptCodes

    // Get fee schedule items to provide default prices
    const feeSchedule = await prisma.feeSchedule.findFirst({
      where: {
        practiceId: session.user.practiceId,
        isDefault: true,
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    })

    // Create a map of CPT codes to prices from the fee schedule
    const priceMap: Record<string, number> = {}
    if (feeSchedule) {
      for (const item of feeSchedule.items) {
        if (item.service) {
          priceMap[item.service.code] = Number(item.fee)
        }
      }
    }

    // Map CPT codes with prices
    const mappedCodes = filteredCodes.map((cpt) => ({
      code: cpt.code,
      name: cpt.description,
      category: cpt.category || 'E/M',
      defaultPrice: priceMap[cpt.code] || 100, // Default to $100 if no price found
      workRVU: cpt.workRVU ? Number(cpt.workRVU) : null,
    }))

    return apiResponse({ data: mappedCodes })
  } catch (error) {
    console.error('Failed to fetch CPT codes:', error)
    return apiError('Failed to fetch CPT codes', 500)
  }
}
