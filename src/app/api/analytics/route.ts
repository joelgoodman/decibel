import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { getAnalytics } from '@/lib/analytics'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = new Date(searchParams.get('startDate') || '')
    const endDate = new Date(searchParams.get('endDate') || '')
    const eventName = searchParams.get('event') || undefined
    const userId = searchParams.get('userId') || undefined

    const analytics = await getAnalytics({
      startDate,
      endDate,
      eventName,
      userId,
    })

    return withApiHeaders(
      Response.json(analytics)
    )
  } catch (error) {
    return handleApiError(error)
  }
}