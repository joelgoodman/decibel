import { Feed } from 'feed'
import { prisma } from '../prisma'
import { formatRFC2822 } from 'date-fns'

interface PodcastFeedOptions {
  seriesId?: string
  baseUrl: string
}

export async function generatePodcastFeed({ seriesId, baseUrl }: PodcastFeedOptions) {
  // Get series info if specified, otherwise get site info
  const series = seriesId ? await prisma.podcastSeries.findUnique({
    where: { id: seriesId },
  }) : null

  const siteInfo = await prisma.settings.findFirst({
    where: { key: 'general' },
  })

  const feed = new Feed({
    title: series?.title || siteInfo?.value.siteName,
    description: series?.description || siteInfo?.value.siteDescription,
    id: `${baseUrl}${series ? `/podcasts/${series.slug}` : '/podcasts'}`,
    link: baseUrl,
    language: series?.language || 'en',
    image: series?.artwork || siteInfo?.value.logo,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: series?.copyright,
    updated: new Date(),
    generator: 'Custom Podcast Feed Generator',
    feedLinks: {
      rss2: `${baseUrl}/feed/podcast${series ? `/${series.slug}` : ''}.xml`,
    },
    author: {
      name: series?.author || siteInfo?.value.siteName,
      link: series?.website || baseUrl,
    },
    // iTunes specific tags
    custom: [
      { 'itunes:explicit': series?.explicit ? 'yes' : 'no' },
      { 'itunes:type': 'episodic' },
      { 'itunes:category': { _attr: { text: 'Technology' } } },
    ],
  })

  // Get episodes
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      ...(seriesId && { seriesId }),
      status: 'published',
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      series: true,
      author: true,
    },
  })

  episodes.forEach((episode) => {
    feed.addItem({
      title: episode.title,
      id: episode.id,
      link: `${baseUrl}/podcasts/${episode.series.slug}/${episode.id}`,
      description: episode.description,
      content: episode.description,
      author: [{ name: episode.author.name }],
      date: new Date(episode.publishedAt!),
      // Podcast specific
      enclosure: {
        url: episode.audioUrl,
        type: 'audio/mpeg',
        length: episode.fileSize || 0,
      },
      custom: [
        { 'itunes:duration': episode.duration },
        { 'itunes:explicit': episode.explicit ? 'yes' : 'no' },
        { 'itunes:episodeType': 'full' },
        { 'itunes:image': { _attr: { href: episode.artwork || episode.series.artwork } } },
      ],
    })
  })

  return feed.rss2()
}