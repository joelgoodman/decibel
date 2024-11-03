import { QueryClient } from '@tanstack/react-query'
import localforage from 'localforage'

const CACHE_KEY_PREFIX = 'app_cache_'
const CACHE_VERSION = 1

// Initialize localforage
const storage = localforage.createInstance({
  name: 'app_cache',
  version: CACHE_VERSION,
})

// Cache persistence layer
export const cache = {
  async getItem(key: string): Promise<unknown> {
    try {
      const cached = await storage.getItem(`${CACHE_KEY_PREFIX}${key}`)
      if (!cached) return null

      const { value, timestamp, ttl } = cached as { 
        value: unknown
        timestamp: number
        ttl: number 
      }

      if (Date.now() - timestamp > ttl) {
        await storage.removeItem(`${CACHE_KEY_PREFIX}${key}`)
        return null
      }

      return value
    } catch (error) {
      console.error('Cache read error:', error)
      return null
    }
  },

  async setItem(key: string, value: unknown, ttl = 1000 * 60 * 60): Promise<void> {
    try {
      await storage.setItem(`${CACHE_KEY_PREFIX}${key}`, {
        value,
        timestamp: Date.now(),
        ttl,
      })
    } catch (error) {
      console.error('Cache write error:', error)
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await storage.removeItem(`${CACHE_KEY_PREFIX}${key}`)
    } catch (error) {
      console.error('Cache remove error:', error)
    }
  },

  async clear(): Promise<void> {
    try {
      await storage.clear()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  },
}