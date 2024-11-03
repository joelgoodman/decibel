import Handlebars from 'handlebars'
import { marked } from 'marked'
import { sanitizeHtml } from '../security/sanitize'
import { prisma } from '../prisma'

interface TemplateResult {
  html: string
  text: string
}

export async function renderTemplate(options: {
  templateId?: string
  content?: string
  variables?: Record<string, any>
}): Promise<TemplateResult> {
  let content = options.content || ''

  if (options.templateId) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: options.templateId },
    })
    if (template) {
      content = template.content
    }
  }

  // Compile template with Handlebars
  const compiled = Handlebars.compile(content)
  const rendered = compiled(options.variables || {})

  // Convert markdown to HTML
  const html = marked(rendered)

  // Sanitize HTML
  const sanitized = sanitizeHtml(html)

  // Generate plain text version
  const text = html.replace(/<[^>]*>/g, '')

  return {
    html: sanitized,
    text,
  }
}