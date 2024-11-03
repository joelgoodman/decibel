import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    await prisma.settings.upsert({
      where: { key: 'setup_completed' },
      update: {
        value: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      },
      create: {
        key: 'setup_completed',
        value: {
          completed: true,
          completedAt: new Date().toISOString(),
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