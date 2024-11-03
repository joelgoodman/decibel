import { NextRequest } from 'next/server'
import { generatePodcastFeed } from '@/lib/rss/podcast-feed'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { series?: string } }
) {
  try {
    let seriesId: string | undefined

    if (params.series) {
      const series = await prisma.podcastSeries.findFirst({
        where: { slug: params.series },
      })
      seriesId = series?.id
    }

    const feed = await generatePodcastFeed({
      seriesId,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    })

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate podcast feed:', error)
    return new Response('Failed to generate feed', { status: 500 })
  }
}