import { z } from 'zod'

export interface PodcastSeries {
  id: string
  title: string
  description: string
  slug: string
  artwork?: string
  author: string
  language: string
  explicit: boolean
  copyright?: string
  website?: string
  status: 'active' | 'archived'
  settings: PodcastSeriesSettings
  createdAt: string
  updatedAt: string
  _count: {
    episodes: number
  }
}

export interface PodcastSeriesSettings {
  defaultArtwork?: string
  defaultExplicit: boolean
  defaultLanguage: string
}

export interface PodcastEpisode {
  id: string
  title: string
  description: string
  audioUrl: string
  duration: number
  seriesId: string
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  scheduledPublishAt?: string
  artwork?: string
  explicit: boolean
  transcript?: string
  author: {
    name: string
  }
  series: PodcastSeries
  createdAt: string
  updatedAt: string
}

export const podcastSeriesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  artwork: z.string().url().optional(),
  author: z.string().min(1, 'Author is required'),
  language: z.string().min(2).max(5),
  explicit: z.boolean().default(false),
  copyright: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  settings: z.object({
    defaultArtwork: z.string().optional(),
    defaultExplicit: z.boolean().default(false),
    defaultLanguage: z.string().default('en'),
  }).default({}),
})

export const podcastEpisodeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  audioUrl: z.string().url('Valid audio URL is required'),
  seriesId: z.string().min(1, 'Series is required'),
  status: z.enum(['draft', 'published', 'scheduled']),
  publishedAt: z.string().datetime().optional(),
  scheduledPublishAt: z.string().datetime().optional(),
  artwork: z.string().url().optional(),
  explicit: z.boolean(),
  transcript: z.string().optional(),
})

export type PodcastSeriesFormValues = z.infer<typeof podcastSeriesSchema>
export type PodcastEpisodeFormValues = z.infer<typeof podcastEpisodeSchema>