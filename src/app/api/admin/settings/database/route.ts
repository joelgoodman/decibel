import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/security/encryption'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { provider, settings } = await req.json()

    // Encrypt sensitive data before storing
    const encryptedSettings = {
      ...settings,
      password: await encrypt(settings.password),
    }

    await prisma.settings.upsert({
      where: { key: 'database' },
      update: {
        value: {
          provider,
          settings: encryptedSettings,
        },
      },
      create: {
        key: 'database',
        value: {
          provider,
          settings: encryptedSettings,
        },
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}