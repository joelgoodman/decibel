import { z } from 'zod'

export type EmailProvider = 'smtp' | 'sendgrid' | 'ses'
export type SearchProvider = 'algolia' | 'meilisearch'

export interface SmtpConfig {
  host: string
  port: number
  username: string
  password: string
  secure: boolean
}

export interface SendgridConfig {
  apiKey: string
}

export interface SesConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export interface EmailSettings {
  provider: EmailProvider
  from: string
  smtp?: SmtpConfig
  sendgrid?: SendgridConfig
  ses?: SesConfig
}

export interface AlgoliaConfig {
  appId: string
  apiKey: string
  searchKey: string
}

export interface MeilisearchConfig {
  host: string
  apiKey: string
}

export interface SearchSettings {
  provider: SearchProvider
  algolia?: AlgoliaConfig
  meilisearch?: MeilisearchConfig
}

export interface SentryConfig {
  enabled: boolean
  dsn?: string
}

export interface MonitoringSettings {
  sentry: SentryConfig
}

export interface IntegrationSettings {
  email: EmailSettings
  search: SearchSettings
  monitoring: MonitoringSettings
}

// Validation schemas
export const smtpConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1, 'Port is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  secure: z.boolean(),
})

export const sendgridConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

export const sesConfigSchema = z.object({
  accessKeyId: z.string().min(1, 'Access key ID is required'),
  secretAccessKey: z.string().min(1, 'Secret access key is required'),
  region: z.string().min(1, 'Region is required'),
})

export const emailSettingsSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid', 'ses']),
  from: z.string().email('Invalid email address'),
  smtp: smtpConfigSchema.optional(),
  sendgrid: sendgridConfigSchema.optional(),
  ses: sesConfigSchema.optional(),
})

export const algoliaConfigSchema = z.object({
  appId: z.string().min(1, 'Application ID is required'),
  apiKey: z.string().min(1, 'API key is required'),
  searchKey: z.string().min(1, 'Search key is required'),
})

export const meilisearchConfigSchema = z.object({
  host: z.string().url('Invalid host URL'),
  apiKey: z.string().min(1, 'API key is required'),
})

export const searchSettingsSchema = z.object({
  provider: z.enum(['algolia', 'meilisearch']),
  algolia: algoliaConfigSchema.optional(),
  meilisearch: meilisearchConfigSchema.optional(),
})

export const monitoringSettingsSchema = z.object({
  sentry: z.object({
    enabled: z.boolean(),
    dsn: z.string().optional(),
  }),
})

export const integrationSettingsSchema = z.object({
  email: emailSettingsSchema,
  search: searchSettingsSchema,
  monitoring: monitoringSettingsSchema,
})