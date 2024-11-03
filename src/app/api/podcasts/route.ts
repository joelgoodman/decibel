import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().default(10),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const podcasts = await prisma.podcast.findMany({
      take: query.limit + 1,
      ...(query.cursor && {
        cursor: {
          id: query.cursor,
        },
      }),
      where: {
        ...(query.search && {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
        ...(query.categoryId && {
          categories: {
            some: { id: query.categoryId },
          },
        }),
        ...(query.status && { status: query.status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        categories: true,
      },
    })

    const hasMore = podcasts.length > query.limit
    const nextCursor = hasMore ? podcasts[query.limit - 1].id : undefined

    return withApiHeaders(
      Response.json({
        podcasts: podcasts.slice(0, query.limit),
        nextCursor,
        hasMore,
      })
    )
  } catch (error) {
    return handleApiError(error)
  }
}