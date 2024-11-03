import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'
import { type PodcastEpisode, type PodcastEpisodeFormValues } from '@/types/podcast'

interface EpisodeQueryParams {
  seriesId?: string
  search?: string
  status?: string
  sort?: string
}

interface EpisodeResponse {
  episodes: PodcastEpisode[]
  nextCursor?: string
  hasMore: boolean
}

export function usePodcastEpisodes(params: EpisodeQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['podcast-episodes', params],
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams()
      if (params.seriesId) searchParams.set('seriesId', params.seriesId)
      if (params.search) searchParams.set('search', params.search)
      if (params.status) searchParams.set('status', params.status)
      if (params.sort) searchParams.set('sort', params.sort)
      if (pageParam) searchParams.set('cursor', pageParam)

      return fetchWithErrorHandling<EpisodeResponse>(
        `/api/podcasts/episodes?${searchParams.toString()}`
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function usePodcastEpisodeById(id: string) {
  return useQuery({
    queryKey: ['podcast-episodes', id],
    queryFn: () => fetchWithErrorHandling<PodcastEpisode>(`/api/podcasts/episodes/${id}`),
    enabled: !!id,
  })
}

export function useCreatePodcastEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PodcastEpisodeFormValues) =>
      fetchWithErrorHandling('/api/podcasts/episodes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['podcast-episodes'])
      queryClient.invalidateQueries(['podcast-episodes', { seriesId: variables.seriesId }])
    },
  })
}

export function useUpdatePodcastEpisode(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PodcastEpisodeFormValues) =>
      fetchWithErrorHandling(`/api/podcasts/episodes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['podcast-episodes'])
      queryClient.invalidateQueries(['podcast-episodes', id])
      queryClient.invalidateQueries(['podcast-episodes', { seriesId: variables.seriesId }])
    },
  })
}

export function useSchedulePodcastEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt: string }) =>
      fetchWithErrorHandling(`/api/podcasts/episodes/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ publishAt }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['podcast-episodes'])
      queryClient.invalidateQueries(['podcast-episodes', variables.id])
    },
  })
}