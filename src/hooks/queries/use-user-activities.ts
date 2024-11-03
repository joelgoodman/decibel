import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useUserActivities() {
  return useQuery({
    queryKey: ['user-activities'],
    queryFn: () => fetchWithErrorHandling('/api/user/activities'),
  })
}