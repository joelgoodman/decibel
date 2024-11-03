import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { 
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listTemplates,
} from '@/lib/email/template-manager'

export async function GET() {
  try {
    const templates = await listTemplates()
    return withApiHeaders(Response.json(templates))
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
    const template = await createTemplate(data)

    return withApiHeaders(Response.json(template))
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
    const template = await updateTemplate(id, data)

    return withApiHeaders(Response.json(template))
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
    await deleteTemplate(id)

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}