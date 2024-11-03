import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors/api-handler'
import { sendEmail } from '@/lib/email/send'
import mjml2html from 'mjml'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { postId, mjml } = await req.json()

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    })

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    const { html } = mjml2html(mjml)

    await sendEmail({
      to: session.user.email,
      subject: `[Test] ${post.title}`,
      html,
      text: post.excerpt || post.title,
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}