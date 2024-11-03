import { z } from 'zod'

export const menuItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['link', 'page', 'category', 'custom']),
  url: z.string().url().optional(),
  pageId: z.string().optional(),
  categoryId: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  icon: z.string().optional(),
  children: z.lazy(() => z.array(menuItemSchema)).default([]),
  visibility: z.object({
    loggedIn: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
    devices: z.array(z.enum(['desktop', 'tablet', 'mobile'])).default(['desktop', 'tablet', 'mobile']),
  }),
})

export const menuSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Menu name is required'),
  location: z.enum(['header', 'footer', 'sidebar']),
  items: z.array(menuItemSchema),
  settings: z.object({
    showIcons: z.boolean().default(true),
    expandable: z.boolean().default(false),
    maxDepth: z.number().min(1).max(5).default(3),
    mobileBreakpoint: z.number().default(768),
  }),
})

export type MenuItem = z.infer<typeof menuItemSchema>
export type Menu = z.infer<typeof menuSchema>