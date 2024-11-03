import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const eventSchema = z.object({
  name: z.string(),
  properties: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    const data = eventSchema.parse(await req.json())

    await prisma.analyticsEvent.create({
      data: {
        name: data.name,
        properties: data.properties,
        userId: session?.userId,
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}