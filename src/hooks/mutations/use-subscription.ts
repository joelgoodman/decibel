import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetchWithErrorHandling('/api/user/subscription', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'subscription'])
    },
  })
}