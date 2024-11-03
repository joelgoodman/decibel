import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'
import { type PodcastSeries, type PodcastSeriesFormValues } from '@/types/podcast'

interface SeriesQueryParams {
  search?: string
  status?: string
  sort?: string
}

interface SeriesResponse {
  series: PodcastSeries[]
  nextCursor?: string
  hasMore: boolean
}

export function usePodcastSeries(params: SeriesQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['podcast-series', params],
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.set('search', params.search)
      if (params.status) searchParams.set('status', params.status)
      if (params.sort) searchParams.set('sort', params.sort)
      if (pageParam) searchParams.set('cursor', pageParam)

      return fetchWithErrorHandling<SeriesResponse>(
        `/api/podcasts/series?${searchParams.toString()}`
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function usePodcastSeriesById(id: string) {
  return useQuery({
    queryKey: ['podcast-series', id],
    queryFn: () => fetchWithErrorHandling<PodcastSeries>(`/api/podcasts/series/${id}`),
    enabled: !!id,
  })
}

export function useCreatePodcastSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PodcastSeriesFormValues) =>
      fetchWithErrorHandling('/api/podcasts/series', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['podcast-series'])
    },
  })
}

export function useUpdatePodcastSeries(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PodcastSeriesFormValues) =>
      fetchWithErrorHandling(`/api/podcasts/series/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['podcast-series'])
      queryClient.invalidateQueries(['podcast-series', id])
    },
  })
}

export function useArchivePodcastSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithErrorHandling(`/api/podcasts/series/${id}/archive`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['podcast-series'])
    },
  })
}