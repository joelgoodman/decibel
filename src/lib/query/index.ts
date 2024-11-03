import { QueryClient } from '@tanstack/react-query'
import { cache } from './cache'
import { retryWithBackoff } from './retry'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: retryWithBackoff,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      keepPreviousData: true,
    },
    mutations: {
      retry: retryWithBackoff,
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

// Global query keys
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.posts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
}