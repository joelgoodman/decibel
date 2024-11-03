import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface UseAuditLogsOptions {
  startDate: Date
  endDate: Date
  entityType?: string
  entityId?: string
  userId?: string
}

export function useAuditLogs(options: UseAuditLogsOptions) {
  return useQuery({
    queryKey: ['audit-logs', options],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString(),
      })

      if (options.entityType) {
        searchParams.set('entityType', options.entityType)
      }
      if (options.entityId) {
        searchParams.set('entityId', options.entityId)
      }
      if (options.userId) {
        searchParams.set('userId', options.userId)
      }

      return fetchWithErrorHandling(`/api/audit-logs?${searchParams.toString()}`)
    },
  })
}