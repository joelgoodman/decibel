import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const vitals = await req.json()

    await prisma.performanceMetric.create({
      data: {
        name: vitals.name,
        value: vitals.value,
        rating: vitals.rating,
        path: vitals.path,
        connectionSpeed: vitals.connectionSpeed,
        navigationType: vitals.navigationType,
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}