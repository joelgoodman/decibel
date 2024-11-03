import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const podcastSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  audioUrl: z.string().url(),
  transcript: z.string().optional(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  published: z.boolean(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: params.id },
      include: {
        author: true,
        categories: true,
        tags: true,
      },
    })

    if (!podcast) {
      return new Response('Podcast not found', { status: 404 })
    }

    return withApiHeaders(
      Response.json(podcast)
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

    const data = podcastSchema.parse(await req.json())
    
    const podcast = await prisma.podcast.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        audioUrl: data.audioUrl,
        transcript: data.transcript,
        status: data.published ? 'published' : 'draft',
        categories: {
          set: data.categoryIds.map(id => ({ id })),
        },
        tags: {
          set: data.tagIds.map(id => ({ id })),
        },
      },
    })

    return withApiHeaders(
      Response.json(podcast)
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

    await prisma.podcast.delete({
      where: { id: params.id },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}