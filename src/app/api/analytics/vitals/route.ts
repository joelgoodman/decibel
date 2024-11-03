import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const vitalsSchema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.string(),
  delta: z.number(),
  id: z.string(),
  navigationType: z.string(),
  path: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const data = vitalsSchema.parse(await req.json())

    await prisma.performanceMetric.create({
      data: {
        name: data.name,
        value: data.value,
        rating: data.rating,
        path: data.path,
        connectionSpeed: req.headers.get('connection-type'),
        navigationType: data.navigationType,
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}