import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useNotificationSettings() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => fetchWithErrorHandling('/api/user/notification-settings'),
  })

  const { mutate } = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await fetchWithErrorHandling('/api/user/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({ id, enabled }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-settings'])
    },
  })

  return {
    data,
    mutate: (id: string, enabled: boolean) => mutate({ id, enabled }),
  }
}