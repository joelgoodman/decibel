import { OpenGraph, SchemaOrg } from './schemas'
import { Post, User, Organization } from '@prisma/client'

export function generateOpenGraph(
  data: Post & { author: User },
  baseUrl: string
): OpenGraph {
  return {
    title: data.title,
    description: data.excerpt || '',
    type: 'article',
    url: `${baseUrl}/posts/${data.slug}`,
    image: data.coverImage,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'en_US',
    article: {
      publishedTime: data.publishedAt?.toISOString(),
      modifiedTime: data.updatedAt.toISOString(),
      author: data.author.name || '',
      tags: data.tags?.map(tag => tag.name) || [],
    },
  }
}

export function generateSchemaOrg(
  data: Post & { author: User },
  organization: Organization,
  baseUrl: string
): SchemaOrg {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt || '',
    image: data.coverImage,
    datePublished: data.publishedAt?.toISOString(),
    dateModified: data.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: data.author.name || '',
      url: `${baseUrl}/authors/${data.author.id}`,
    },
    publisher: {
      '@type': 'Organization',
      name: organization.name,
      logo: {
        '@type': 'ImageObject',
        url: organization.logo || '',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/posts/${data.slug}`,
    },
  }
}