import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { email } = await req.json()

    await sendEmail({
      to: email,
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>This is a test email to verify your email settings.</p>',
      text: 'Test Email\n\nThis is a test email to verify your email settings.',
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}