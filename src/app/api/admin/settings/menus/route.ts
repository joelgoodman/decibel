import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { menuSchema } from '@/types/menu'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const menus = await prisma.settings.findFirst({
      where: { key: 'menus' },
    })

    return withApiHeaders(
      Response.json(menus?.value || [])
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = menuSchema.parse(await req.json())

    await prisma.settings.upsert({
      where: { key: 'menus' },
      update: {
        value: data,
      },
      create: {
        key: 'menus',
        value: data,
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}