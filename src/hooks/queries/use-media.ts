import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface MediaQueryParams {
  search?: string
  folder?: string | null
  type?: string
  page?: number
  limit?: number
}

export function useMediaLibrary(params: MediaQueryParams = {}) {
  return useQuery({
    queryKey: ['media', params],
    queryFn: () => fetchWithErrorHandling('/api/media', { params }),
  })
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => fetchWithErrorHandling(`/api/media/${id}`),
    enabled: !!id,
  })
}