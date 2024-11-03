import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { sanitizeHtml } from './sanitize'

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')

export const slugSchema = z
  .string()
  .min(3, 'Slug is too short')
  .max(100, 'Slug is too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(2048, 'URL is too long')

// Content validation with sanitization
export const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(100000, 'Content is too long')
  .transform((val) => sanitizeHtml(val))

// Custom validation functions
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: {
    errorMap?: z.ZodErrorMap
    stripUnknown?: boolean
  }
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.errors[0].message,
      })
    }
    throw error
  }
}

// Rate limiting helper
export function createRateLimiter(options: {
  windowMs: number
  maxRequests: number
}) {
  const requests = new Map<string, { count: number; firstRequest: number }>()

  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - options.windowMs
    const requestData = requests.get(identifier)

    // Clean up old requests
    if (requestData && requestData.firstRequest < windowStart) {
      requests.delete(identifier)
    }

    // Check current request count
    if (!requestData) {
      requests.set(identifier, { count: 1, firstRequest: now })
      return true
    }

    if (requestData.count >= options.maxRequests) {
      return false
    }

    requestData.count++
    return true
  }
}