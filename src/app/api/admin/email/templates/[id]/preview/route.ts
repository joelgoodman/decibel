import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { renderEmailTemplate } from '@/lib/email/template-manager'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { variables } = await req.json()
    const rendered = await renderEmailTemplate(params.id, variables)

    return withApiHeaders(Response.json(rendered))
  } catch (error) {
    return handleApiError(error)
  }
}