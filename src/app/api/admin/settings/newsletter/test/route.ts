import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { sendTestEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { email } = await req.json()

    await sendTestEmail(email)

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}