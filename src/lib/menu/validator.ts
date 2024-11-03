import { z } from 'zod'

const menuItemSchema = z.object({
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

const menuSchema = z.object({
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

export async function validateMenu(menu: any) {
  // Validate schema
  const validated = menuSchema.parse(menu)

  // Validate menu depth
  const maxDepth = validated.settings.maxDepth
  validateMenuDepth(validated.items, maxDepth)

  return validated
}

function validateMenuDepth(items: any[], maxDepth: number, currentDepth = 1) {
  if (currentDepth > maxDepth) {
    throw new Error(`Menu depth exceeds maximum allowed depth of ${maxDepth}`)
  }

  for (const item of items) {
    if (item.children?.length > 0) {
      validateMenuDepth(item.children, maxDepth, currentDepth + 1)
    }
  }
}