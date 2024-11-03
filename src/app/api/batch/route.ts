import { NextRequest } from 'next/server'
import { withApiHeaders, withCacheHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get('ids')?.split(',') || []

    if (!ids.length) {
      return Response.json(
        { error: 'No IDs provided' },
        { status: 400 }
      )
    }

    const items = await prisma.post.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        author: true,
        categories: true,
      },
    })

    const response = Response.json(
      items.reduce((acc, item) => ({
        ...acc,
        [item.id]: item,
      }), {})
    )

    return withApiHeaders(
      withCacheHeaders(response, {
        maxAge: 60, // 1 minute
        staleWhileRevalidate: 3600, // 1 hour
      })
    )
  } catch (error) {
    return handleApiError(error)
  }
}