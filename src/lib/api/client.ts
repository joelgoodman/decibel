import { type APIError } from '@/lib/errors/types'

interface ClientConfig {
  baseURL: string
  headers?: Record<string, string>
}

export function createClient(config: ClientConfig) {
  const { baseURL, headers: defaultHeaders } = config

  async function request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const url = `${baseURL}${endpoint}`
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'API request failed')
      }

      return response.json()
    } catch (error) {
      const apiError = error as APIError
      throw apiError
    }
  }

  return {
    get: (endpoint: string, options?: RequestInit) => 
      request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, data?: any, options?: RequestInit) => 
      request(endpoint, { 
        ...options, 
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      }),
    put: (endpoint: string, data?: any, options?: RequestInit) => 
      request(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      }),
    delete: (endpoint: string, options?: RequestInit) => 
      request(endpoint, { ...options, method: 'DELETE' }),
  }
}