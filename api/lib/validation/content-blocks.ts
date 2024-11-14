import { z } from 'zod';
import { sanitizeHtml } from './sanitize';

// Base block schema that all block types must extend
const baseBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  meta: z.object({
    hidden: z.boolean().optional(),
    className: z.string().optional(),
  }).optional(),
});

// Text block schema with HTML sanitization
const textBlockSchema = baseBlockSchema.extend({
  type: z.literal('text'),
  data: z.object({
    text: z.string()
      .min(1)
      .transform(text => sanitizeHtml(text)),
    format: z.enum(['paragraph', 'heading-1', 'heading-2', 'heading-3']),
  }),
});

// Image block schema with URL validation
const imageBlockSchema = baseBlockSchema.extend({
  type: z.literal('image'),
  data: z.object({
    url: z.string().url(),
    alt: z.string(),
    caption: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }),
});

// Code block schema
const codeBlockSchema = baseBlockSchema.extend({
  type: z.literal('code'),
  data: z.object({
    code: z.string().min(1),
    language: z.string().min(1),
    highlightLines: z.array(z.number().positive()).optional(),
  }),
});

// List block schema
const listBlockSchema = baseBlockSchema.extend({
  type: z.literal('list'),
  data: z.object({
    items: z.array(z.string().transform(text => sanitizeHtml(text))),
    style: z.enum(['bullet', 'ordered', 'check']),
  }),
});

// Quote block schema
const quoteBlockSchema = baseBlockSchema.extend({
  type: z.literal('quote'),
  data: z.object({
    text: z.string().transform(text => sanitizeHtml(text)),
    author: z.string().optional(),
    source: z.string().url().optional(),
  }),
});

// Embed block schema with allowed providers
const embedBlockSchema = baseBlockSchema.extend({
  type: z.literal('embed'),
  data: z.object({
    url: z.string().url(),
    type: z.enum(['youtube', 'twitter', 'github']),
    aspectRatio: z.enum(['16:9', '4:3', '1:1']).optional(),
  }),
});

// Union of all block types
export const blockSchema = z.discriminatedUnion('type', [
  textBlockSchema,
  imageBlockSchema,
  codeBlockSchema,
  listBlockSchema,
  quoteBlockSchema,
  embedBlockSchema,
]);

// Content schema with metadata and blocks
export const contentSchema = z.object({
  title: z.string().min(1).max(200).transform(title => sanitizeHtml(title)),
  description: z.string().max(500).optional()
    .transform(desc => desc ? sanitizeHtml(desc) : desc),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']),
  blocks: z.array(blockSchema)
    .min(1, 'Content must have at least one block')
    .max(100, 'Content cannot have more than 100 blocks'),
  metadata: z.record(z.any()).optional(),
  scheduledAt: z.string().datetime().optional(),
  taxonomies: z.array(z.string().uuid()).optional(),
}).refine(
  data => {
    if (data.status === 'SCHEDULED') {
      if (!data.scheduledAt) return false;
      const scheduledDate = new Date(data.scheduledAt);
      if (scheduledDate <= new Date()) return false;
    }
    return true;
  },
  {
    message: "Invalid scheduling configuration",
    path: ["scheduledAt"],
  }
).refine(
  data => {
    // Ensure at least one visible block
    return data.blocks.some(block => !block.meta?.hidden);
  },
  {
    message: "Content must have at least one visible block",
    path: ["blocks"],
  }
);