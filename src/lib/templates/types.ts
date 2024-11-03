import { z } from 'zod'

export const templateConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  framework: z.enum(['react', 'vue', 'svelte']),
  styling: z.enum(['css', 'scss', 'tailwind', 'styled-components']),
  features: z.array(z.enum([
    'authentication',
    'blog',
    'podcast',
    'comments',
    'search',
    'newsletter'
  ])),
  settings: z.record(z.any()).optional(),
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>

export interface Template {
  id: string
  config: TemplateConfig
  files: TemplateFile[]
}

export interface TemplateFile {
  path: string
  content: string
  type: 'component' | 'style' | 'config' | 'util'
}