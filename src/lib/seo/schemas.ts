import { z } from 'zod'

export const openGraphSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(155),
  type: z.enum(['website', 'article', 'profile']),
  image: z.string().url().optional(),
  url: z.string().url(),
  siteName: z.string().optional(),
  locale: z.string().optional(),
  article: z.object({
    publishedTime: z.string().optional(),
    modifiedTime: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
})

export const schemaOrgSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.enum(['Article', 'BlogPosting', 'WebPage', 'Person', 'Organization']),
  headline: z.string().min(1).max(110),
  description: z.string().optional(),
  image: z.string().url().optional(),
  datePublished: z.string().optional(),
  dateModified: z.string().optional(),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.string(),
    url: z.string().url().optional(),
  }).optional(),
  publisher: z.object({
    '@type': z.literal('Organization'),
    name: z.string(),
    logo: z.object({
      '@type': z.literal('ImageObject'),
      url: z.string().url(),
    }).optional(),
  }).optional(),
  mainEntityOfPage: z.object({
    '@type': z.literal('WebPage'),
    '@id': z.string().url(),
  }).optional(),
})

export type OpenGraph = z.infer<typeof openGraphSchema>
export type SchemaOrg = z.infer<typeof schemaOrgSchema>