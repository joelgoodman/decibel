import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { logRequest } from '@/lib/monitoring/logger'
import { corsMiddleware } from '@/lib/security/cors'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { trackEvent } from '@/lib/analytics'
import { createAuditLog } from '@/lib/audit'

const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

const authLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
})

export async function middleware(request: NextRequest) {
  try {
    // Log request
    const startTime = Date.now()
    const requestId = crypto.randomUUID()

    logRequest.info({
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    }, 'Incoming request')

    // Apply CORS headers
    const corsHeaders = corsMiddleware(request)
    if (corsHeaders) {
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders })
      }
    }

    // Get client IP
    const ip = request.ip || 'unknown'

    // Rate limiting
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const isLimited = await apiLimiter.isRateLimited(ip)
      if (isLimited) {
        logRequest.warn({ ip }, 'API rate limit exceeded')
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      const isLimited = await authLimiter.isRateLimited(ip)
      if (isLimited) {
        logRequest.warn({ ip }, 'Auth rate limit exceeded')
        return new NextResponse(
          JSON.stringify({ error: 'Too many authentication attempts' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Track analytics
    const session = await getSession(request)
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      await trackEvent(request, {
        name: 'page_view',
        properties: {
          path: request.nextUrl.pathname,
          referrer: request.headers.get('referer'),
        },
      })
    }

    // Process request
    const response = await NextResponse.next()

    // Log response
    const duration = Date.now() - startTime
    logRequest.info({
      requestId,
      status: response.status,
      duration,
    }, 'Request completed')

    // Audit log for sensitive operations
    if (
      session &&
      request.method !== 'GET' &&
      request.nextUrl.pathname.startsWith('/api/admin')
    ) {
      await createAuditLog(request, {
        action: request.method.toLowerCase() as any,
        entityType: request.nextUrl.pathname.split('/')[3],
        entityId: request.nextUrl.pathname.split('/')[4] || 'unknown',
        metadata: {
          path: request.nextUrl.pathname,
          method: request.method,
        },
      })
    }

    return response
  } catch (error) {
    logRequest.error(error, 'Middleware error')
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}