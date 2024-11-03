import { z } from 'zod'

export const themeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  preview: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
})

export type Theme = z.infer<typeof themeSchema>

export interface ThemeSettings {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    fontFamily: string
    headings: {
      fontFamily: string
      fontWeight: string
    }
  }
  spacing: {
    unit: number
    container: {
      maxWidth: string
      padding: string
    }
  }
  borderRadius: string
  boxShadow: string
}