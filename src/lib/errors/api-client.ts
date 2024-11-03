import { APIError, NetworkError, type ErrorResponse } from './types'

interface FetchOptions extends RequestInit {
  timeout?: number
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json()
      throw new APIError(
        errorData.error.message,
        errorData.error.code || 'UNKNOWN_ERROR',
        response.status,
        response.status >= 500 ? 'high' : 'medium'
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(
        'Request timeout',
        'TIMEOUT_ERROR',
        408,
        'high'
      )
    }

    if (!navigator.onLine) {
      throw new NetworkError('No internet connection')
    }

    throw new NetworkError(
      error instanceof Error ? error.message : 'Network request failed'
    )
  }
}