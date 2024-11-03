import { z } from 'zod'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

// Configure DOMPurify
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
]

const ALLOWED_ATTR = ['href', 'title', 'target']

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
  })
}

export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '')
}

// Common validation schemas
export const urlSchema = z.string().url().max(2048)

export const emailSchema = z.string().email().min(5).max(255)

export const slugSchema = z.string()
  .min(3)
  .max(100)
  .regex(/^[a-z0-9-]+$/)
  .transform(val => val.toLowerCase())

export const metadataSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeText),
  description: z.string().max(500).transform(sanitizeText),
  keywords: z.array(z.string().max(50).transform(sanitizeText)),
})