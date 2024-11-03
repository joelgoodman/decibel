import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { renderEmailTemplate } from '@/lib/email/template-manager'
import { sendEmail } from '@/lib/email/send'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { email, variables } = await req.json()
    const rendered = await renderEmailTemplate(params.id, variables)

    await sendEmail({
      to: email,
      subject: `[Test] Email Template Preview`,
      ...rendered,
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}