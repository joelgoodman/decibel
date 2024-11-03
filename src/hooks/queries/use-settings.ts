import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchWithErrorHandling('/api/admin/settings'),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      return fetchWithErrorHandling('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
    },
  })
}