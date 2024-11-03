import { useState, useCallback } from 'react'
import { api } from '../api-client'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi(endpoint: keyof typeof api, options: UseApiOptions = {}) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (...args: any[]) => {
    try {
      setIsLoading(true)
      setError(null)
      // @ts-ignore - Dynamic access
      const result = await api[endpoint](...args)
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, options])

  return {
    data,
    error,
    isLoading,
    execute,
  }
}