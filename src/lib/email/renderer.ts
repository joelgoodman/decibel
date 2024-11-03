import Handlebars from 'handlebars'
import { marked } from 'marked'
import mjml2html from 'mjml'
import { sanitizeHtml } from '../security/sanitize'

// Register custom Handlebars helpers
Handlebars.registerHelper('date', function(date: Date, format: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format === 'short' ? 'short' : 'long',
  }).format(date)
})

Handlebars.registerHelper('markdown', function(text: string) {
  return new Handlebars.SafeString(marked(text))
})

export async function renderTemplate(
  content: string,
  variables: Record<string, any>
) {
  try {
    // Compile template with Handlebars
    const template = Handlebars.compile(content)
    const rendered = template(variables)

    // Convert to MJML if content contains MJML tags
    if (content.includes('<mjml>')) {
      const { html, errors } = mjml2html(rendered)
      if (errors.length > 0) {
        throw new Error(`MJML errors: ${errors[0].message}`)
      }
      return {
        html: sanitizeHtml(html),
        text: htmlToText(html),
      }
    }

    // Convert markdown to HTML
    const html = marked(rendered)
    return {
      html: sanitizeHtml(html),
      text: htmlToText(html),
    }
  } catch (error) {
    throw new Error(`Template rendering failed: ${error.message}`)
  }
}

function htmlToText(html: string): string {
  // Simple HTML to text conversion
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}