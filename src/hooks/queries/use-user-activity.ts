import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface UseUserActivityOptions {
  startDate: Date
  endDate: Date
  eventName?: string
  userId?: string
}

export function useUserActivity(options: UseUserActivityOptions) {
  return useQuery({
    queryKey: ['user-activity', options],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString(),
      })

      if (options.eventName) {
        searchParams.set('event', options.eventName)
      }
      if (options.userId) {
        searchParams.set('userId', options.userId)
      }

      return fetchWithErrorHandling(`/api/analytics?${searchParams.toString()}`)
    },
  })
}