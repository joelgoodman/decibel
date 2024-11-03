import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { type AuditAction } from '@/lib/audit'

export function useAuditTracking() {
  const { toast } = useToast()

  const trackAction = useCallback(async (
    action: AuditAction,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          entityType,
          entityId,
          metadata,
        }),
      })
    } catch (error) {
      console.error('Failed to track audit action:', error)
      toast({
        title: 'Error',
        description: 'Failed to track action',
        variant: 'destructive',
      })
    }
  }, [toast])

  return { trackAction }
}