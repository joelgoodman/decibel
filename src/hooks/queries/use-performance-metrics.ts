import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface UsePerformanceMetricsOptions {
  startDate: Date
  endDate: Date
  metricName?: string
  path?: string
}

export function usePerformanceMetrics(options: UsePerformanceMetricsOptions) {
  return useQuery({
    queryKey: ['performance-metrics', options],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString(),
      })

      if (options.metricName) {
        searchParams.set('metric', options.metricName)
      }
      if (options.path) {
        searchParams.set('path', options.path)
      }

      return fetchWithErrorHandling(`/api/performance?${searchParams.toString()}`)
    },
  })
}