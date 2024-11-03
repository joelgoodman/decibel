import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const series = await prisma.podcastSeries.findMany({
      where: {
        ...(query.search && {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
        ...(query.status && query.status !== 'all' && {
          status: query.status,
        }),
      },
      orderBy: {
        ...(query.sort === 'oldest' && { createdAt: 'asc' }),
        ...(query.sort === 'newest' && { createdAt: 'desc' }),
        ...(query.sort === 'title' && { title: 'asc' }),
      },
      include: {
        categories: true,
        _count: {
          select: { episodes: true },
        },
      },
    })

    return withApiHeaders(
      Response.json({ series })
    )
  } catch (error) {
    return handleApiError(error)
  }
}