import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { 
  createMenu,
  updateMenu,
  deleteMenu,
  listMenus,
} from '@/lib/menu/menu-manager'

export async function GET() {
  try {
    const menus = await listMenus()
    return withApiHeaders(Response.json(menus))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const menu = await createMenu(data)

    return withApiHeaders(Response.json(menu))
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

    const { id, ...data } = await req.json()
    const menu = await updateMenu(id, data)

    return withApiHeaders(Response.json(menu))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { id } = await req.json()
    await deleteMenu(id)

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}