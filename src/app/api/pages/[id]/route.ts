import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  template: z.string(),
  parentId: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()),
    ogImage: z.string().optional(),
    noIndex: z.boolean(),
    canonical: z.string().optional(),
  }),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        seo: true,
        author: true,
        parent: true,
        children: true,
      },
    })

    if (!page) {
      return new Response('Page not found', { status: 404 })
    }

    return withApiHeaders(
      Response.json(page)
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = pageSchema.parse(await req.json())
    
    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        template: data.template,
        parentId: data.parentId,
        path: await generatePagePath(data.slug, data.parentId),
        seo: {
          upsert: {
            create: data.seo,
            update: data.seo,
          },
        },
      },
    })

    return withApiHeaders(
      Response.json(page)
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    await prisma.page.delete({
      where: { id: params.id },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}

async function generatePagePath(slug: string, parentId?: string): Promise<string> {
  if (!parentId) return `/${slug}`

  const parent = await prisma.page.findUnique({
    where: { id: parentId },
    select: { path: true },
  })

  if (!parent) throw new Error('Parent page not found')

  return `${parent.path}/${slug}`
}