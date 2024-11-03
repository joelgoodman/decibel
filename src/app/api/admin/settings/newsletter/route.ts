import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const newsletterSettingsSchema = z.object({
  enabled: z.boolean(),
  defaultFromName: z.string().min(1),
  defaultFromEmail: z.string().email(),
  subscriptionSettings: z.object({
    doubleOptIn: z.boolean(),
    welcomeEmail: z.boolean(),
    unsubscribeLink: z.boolean(),
    confirmationTemplate: z.string().optional(),
    welcomeTemplate: z.string().optional(),
  }),
  deliverySettings: z.object({
    batchSize: z.number().min(1).max(1000),
    sendInterval: z.number().min(1),
    retryAttempts: z.number().min(0).max(5),
  }),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().min(1),
    username: z.string().min(1),
    password: z.string().min(1),
    secure: z.boolean(),
  }),
})

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = newsletterSettingsSchema.parse(await req.json())

    await prisma.settings.update({
      where: { id: 'newsletter' },
      data: {
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