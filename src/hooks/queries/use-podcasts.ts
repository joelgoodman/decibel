import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface PodcastsQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
}

interface PodcastsResponse {
  podcasts: any[]
  nextCursor?: string
  hasMore: boolean
}

export function usePodcasts(params: PodcastsQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['podcasts', params],
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams({
        ...params,
        cursor: pageParam,
      } as any)

      return fetchWithErrorHandling<PodcastsResponse>(
        `/api/podcasts?${searchParams.toString()}`
      )
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    keepPreviousData: true,
  })
}

export function usePodcast(id: string) {
  return useQuery({
    queryKey: ['podcasts', id],
    queryFn: () => fetchWithErrorHandling(`/api/podcasts/${id}`),
    enabled: !!id,
  })
}