import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { getPerformanceMetrics } from '@/lib/performance'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.role === 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = new Date(searchParams.get('startDate') || '')
    const endDate = new Date(searchParams.get('endDate') || '')
    const path = searchParams.get('path') || undefined
    const metricName = searchParams.get('metric') || undefined

    const metrics = await getPerformanceMetrics({
      startDate,
      endDate,
      path,
      metricName,
    })

    return withApiHeaders(
      Response.json(metrics)
    )
  } catch (error) {
    return handleApiError(error)
  }
}