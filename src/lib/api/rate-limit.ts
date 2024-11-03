import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter } from '../security/validation'

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function rateLimit(req: NextRequest) {
    const ip = req.ip || 'unknown'
    
    if (!apiLimiter(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests, please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900',
          },
        }
      )
    }

    return handler(req)
  }
}