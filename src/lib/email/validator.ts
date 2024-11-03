import { z } from 'zod'
import Handlebars from 'handlebars'
import mjml2html from 'mjml'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()),
})

export async function validateTemplate(template: any) {
  // Validate schema
  const validated = templateSchema.parse(template)

  // Validate Handlebars syntax
  try {
    Handlebars.compile(validated.content)
  } catch (error) {
    throw new Error(`Invalid Handlebars syntax: ${error.message}`)
  }

  // Validate MJML if present
  if (validated.content.includes('<mjml>')) {
    const { errors } = mjml2html(validated.content)
    if (errors.length > 0) {
      throw new Error(`Invalid MJML: ${errors[0].message}`)
    }
  }

  // Validate variables usage
  const usedVariables = findUsedVariables(validated.content)
  const undeclaredVariables = usedVariables.filter(
    v => !validated.variables.includes(v)
  )

  if (undeclaredVariables.length > 0) {
    throw new Error(
      `Undeclared variables used in template: ${undeclaredVariables.join(', ')}`
    )
  }

  return validated
}

function findUsedVariables(content: string): string[] {
  const regex = /{{[^}]+}}/g
  const matches = content.match(regex) || []
  return matches
    .map(match => match.replace(/[{}]/g, '').trim())
    .filter(v => !v.startsWith('#') && !v.startsWith('/'))
}