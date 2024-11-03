import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const settings = await prisma.settings.findMany({
      select: {
        key: true,
        value: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
    }

    return withApiHeaders(
      new Response(JSON.stringify(backup, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="settings-backup-${new Date().toISOString()}.json"`,
        },
      })
    )
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

    const backup = await req.json()

    // Validate backup format
    if (!backup.version || !backup.settings) {
      throw new Error('Invalid backup format')
    }

    // Restore settings
    await Promise.all(
      backup.settings.map((setting: any) =>
        prisma.settings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type,
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type,
          },
        })
      )
    )

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}