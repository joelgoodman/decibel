import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return new Response('Template not found', { status: 404 })
    }

    const duplicate = await prisma.emailTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
      },
    })

    return withApiHeaders(
      Response.json(duplicate)
    )
  } catch (error) {
    return handleApiError(error)
  }
}