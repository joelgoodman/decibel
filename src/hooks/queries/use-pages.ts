import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface PagesQueryParams {
  search?: string
  status?: string
  template?: string
}

export function usePages(params: PagesQueryParams = {}) {
  return useQuery({
    queryKey: ['pages', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.set('search', params.search)
      if (params.status) searchParams.set('status', params.status)
      if (params.template) searchParams.set('template', params.template)

      return fetchWithErrorHandling(`/api/pages?${searchParams.toString()}`)
    },
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: () => fetchWithErrorHandling(`/api/pages/${id}`),
    enabled: !!id,
  })
}