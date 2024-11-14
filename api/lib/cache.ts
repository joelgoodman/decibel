import { redis } from './redis';
import { createHash } from 'crypto';

// Cache configuration
const DEFAULT_TTL = 5 * 60; // 5 minutes
const MAX_CACHE_SIZE = 10000; // Maximum number of cache entries
const CACHE_PREFIX = 'cache:';

// Cache key generator
export function createCacheKey(parts: (string | number)[]): string {
  const key = parts.join(':');
  const hash = createHash('sha256').update(key).digest('hex');
  return `${CACHE_PREFIX}${hash}`;
}

export class CacheService {
  private static instance: CacheService;

  private constructor() {
    this.setupCacheMonitoring();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      // Update access time for LRU
      await redis.zAdd('cache:lru', {
        score: Date.now(),
        value: key
      });

      return JSON.parse(data);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl = DEFAULT_TTL): Promise<void> {
    try {
      // Check cache size before adding new entry
      await this.enforceCacheLimit();

      // Store data with TTL
      await redis.setEx(key, ttl, JSON.stringify(data));

      // Add to LRU sorted set
      await redis.zAdd('cache:lru', {
        score: Date.now(),
        value: key
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_PREFIX}${pattern}*`);
      if (keys.length > 0) {
        await redis.del(keys);
        await redis.zRem('cache:lru', ...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(keys);
        await redis.del('cache:lru');
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  private async enforceCacheLimit(): Promise<void> {
    try {
      const size = await redis.zCard('cache:lru');
      if (size >= MAX_CACHE_SIZE) {
        // Remove oldest 10% of entries
        const removeCount = Math.ceil(MAX_CACHE_SIZE * 0.1);
        const oldestKeys = await redis.zRange('cache:lru', 0, removeCount - 1);
        
        if (oldestKeys.length > 0) {
          await redis.del(oldestKeys);
          await redis.zRem('cache:lru', ...oldestKeys);
        }
      }
    } catch (error) {
      console.error('Cache limit enforcement error:', error);
    }
  }

  private setupCacheMonitoring(): void {
    // Monitor cache size every minute
    setInterval(async () => {
      try {
        const size = await redis.zCard('cache:lru');
        console.debug(`Current cache size: ${size}/${MAX_CACHE_SIZE}`);
      } catch (error) {
        console.error('Cache monitoring error:', error);
      }
    }, 60000);
  }
}

export const cacheService = CacheService.getInstance();