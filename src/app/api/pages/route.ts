import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  template: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const pages = await prisma.page.findMany({
      where: {
        ...(query.search && {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { content: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
        ...(query.status && query.status !== 'all' && {
          status: query.status,
        }),
        ...(query.template && query.template !== 'all' && {
          template: query.template,
        }),
      },
      include: {
        seo: true,
        author: {
          select: {
            name: true,
          },
        },
        children: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' },
        { title: 'asc' },
      ],
    })

    return withApiHeaders(
      Response.json({ pages })
    )
  } catch (error) {
    return handleApiError(error)
  }
}