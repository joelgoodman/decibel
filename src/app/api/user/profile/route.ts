import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
})

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = profileSchema.parse(await req.json())

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
    })

    return withApiHeaders(
      Response.json(user)
    )
  } catch (error) {
    return handleApiError(error)
  }
}