import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const scheduleSchema = z.object({
  publishAt: z.string().datetime(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { publishAt } = scheduleSchema.parse(await req.json())

    const podcast = await prisma.podcast.update({
      where: { id: params.id },
      data: {
        status: 'scheduled',
        scheduledPublishAt: new Date(publishAt),
      },
    })

    return withApiHeaders(
      Response.json(podcast)
    )
  } catch (error) {
    return handleApiError(error)
  }
}