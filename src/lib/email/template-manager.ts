import { prisma } from '@/lib/prisma'
import { type EmailTemplate } from '@prisma/client'
import { renderTemplate } from './renderer'
import { validateTemplate } from './validator'

export async function createTemplate(data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  // Validate template before saving
  await validateTemplate(data)

  return prisma.emailTemplate.create({
    data,
  })
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  })

  if (!template) {
    throw new Error('Template not found')
  }

  // Validate updated template
  await validateTemplate({
    ...template,
    ...data,
  })

  return prisma.emailTemplate.update({
    where: { id },
    data,
  })
}

export async function deleteTemplate(id: string) {
  return prisma.emailTemplate.delete({
    where: { id },
  })
}

export async function getTemplate(id: string) {
  return prisma.emailTemplate.findUnique({
    where: { id },
  })
}

export async function listTemplates() {
  return prisma.emailTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function renderEmailTemplate(
  templateId: string,
  variables: Record<string, any>
) {
  const template = await getTemplate(templateId)
  if (!template) {
    throw new Error('Template not found')
  }

  return renderTemplate(template.content, variables)
}