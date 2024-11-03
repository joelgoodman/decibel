import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/security/encryption'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const settings = await prisma.settings.findMany()
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    return withApiHeaders(
      Response.json(settingsMap)
    )
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

    const data = await req.json()

    // Encrypt sensitive data
    const encryptedData = await encryptSensitiveData(data)

    // Update settings
    await Promise.all(
      Object.entries(encryptedData).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
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

async function encryptSensitiveData(data: Record<string, any>): Promise<Record<string, any>> {
  const sensitiveKeys = ['database', 'email', 'api_keys', 'credentials']
  const encrypted: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(k => key.includes(k))) {
      if (typeof value === 'object') {
        encrypted[key] = await encryptSensitiveData(value)
      } else {
        encrypted[key] = await encrypt(value)
      }
    } else {
      encrypted[key] = value
    }
  }

  return encrypted
}