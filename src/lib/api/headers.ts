import { NextResponse } from 'next/server'

const CACHE_CONTROL_DEFAULTS = {
  public: true,
  maxAge: 60, // 1 minute
  staleWhileRevalidate: 60 * 60, // 1 hour
}

interface CacheOptions {
  public?: boolean
  maxAge?: number
  staleWhileRevalidate?: number
  mustRevalidate?: boolean
}

export function withCacheHeaders(
  response: NextResponse,
  options: CacheOptions = {}
): NextResponse {
  const {
    public: isPublic = CACHE_CONTROL_DEFAULTS.public,
    maxAge = CACHE_CONTROL_DEFAULTS.maxAge,
    staleWhileRevalidate = CACHE_CONTROL_DEFAULTS.staleWhileRevalidate,
    mustRevalidate = false,
  } = options

  const directives = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ]

  if (mustRevalidate) {
    directives.push('must-revalidate')
  }

  response.headers.set('Cache-Control', directives.join(', '))
  response.headers.set('Vary', 'Accept, Accept-Encoding')

  return response
}

export function withApiHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  // Compression hint
  response.headers.set('Accept-Encoding', 'gzip, deflate, br')

  return response
}