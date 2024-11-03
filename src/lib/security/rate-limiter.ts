import { Redis } from '@upstash/redis'
import { TRPCError } from '@trpc/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  prefix?: string
}

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  private getKey(identifier: string): string {
    return `${this.config.prefix || 'rate-limit'}:${identifier}`
  }

  async isRateLimited(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Get current requests in window
      const requests = await redis.zcount(key, windowStart, now)

      if (requests >= this.config.maxRequests) {
        return true
      }

      // Add new request
      await redis.zadd(key, { score: now, member: now.toString() })
      
      // Remove old requests
      await redis.zremrangebyscore(key, 0, windowStart)
      
      // Set expiry
      await redis.expire(key, Math.ceil(this.config.windowMs / 1000))

      return false
    } catch (error) {
      console.error('Rate limiter error:', error)
      return false // Fail open if Redis is down
    }
  }
}

// Predefined rate limiters
export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  prefix: 'upload',
})

export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  prefix: 'api',
})

export const authLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  prefix: 'auth',
})