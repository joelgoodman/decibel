import { NextRequest } from 'next/server'
import { generatePostFeed } from '@/lib/rss/post-feed'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category') || undefined
    const tagId = searchParams.get('tag') || undefined
    const format = searchParams.get('format') || 'rss'

    const feed = await generatePostFeed({
      categoryId,
      tagId,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    })

    const content = format === 'json' ? feed.json : feed.rss
    const contentType = format === 'json' ? 'application/json' : 'application/rss+xml'

    return new Response(content, {
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate post feed:', error)
    return new Response('Failed to generate feed', { status: 500 })
  }
}