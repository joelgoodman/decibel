import { Feed } from 'feed'
import { prisma } from '../prisma'

interface PostFeedOptions {
  categoryId?: string
  tagId?: string
  baseUrl: string
}

export async function generatePostFeed({ categoryId, tagId, baseUrl }: PostFeedOptions) {
  const siteInfo = await prisma.settings.findFirst({
    where: { key: 'general' },
  })

  // Get category or tag info if specified
  const category = categoryId ? await prisma.category.findUnique({
    where: { id: categoryId },
  }) : null

  const tag = tagId ? await prisma.tag.findUnique({
    where: { id: tagId },
  }) : null

  const feed = new Feed({
    title: category?.name || tag?.name || siteInfo?.value.siteName,
    description: siteInfo?.value.siteDescription,
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: siteInfo?.value.logo,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: new Date(),
    feedLinks: {
      rss2: `${baseUrl}/feed${category ? `/category/${category.slug}` : tag ? `/tag/${tag.slug}` : ''}.xml`,
      json: `${baseUrl}/feed${category ? `/category/${category.slug}` : tag ? `/tag/${tag.slug}` : ''}.json`,
    },
    author: {
      name: siteInfo?.value.siteName,
      email: siteInfo?.value.contactEmail,
    },
  })

  // Get posts
  const posts = await prisma.post.findMany({
    where: {
      status: 'published',
      ...(categoryId && {
        categories: {
          some: { id: categoryId },
        },
      }),
      ...(tagId && {
        tags: {
          some: { id: tagId },
        },
      }),
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      author: true,
      categories: true,
      tags: true,
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.id,
      link: `${baseUrl}/posts/${post.slug}`,
      description: post.excerpt || '',
      content: post.content,
      author: [{ name: post.author.name }],
      date: new Date(post.publishedAt!),
      image: post.coverImage,
      category: post.categories.map(cat => ({
        name: cat.name,
        term: cat.slug,
      })),
    })
  })

  return {
    rss: feed.rss2(),
    json: feed.json1(),
  }
}