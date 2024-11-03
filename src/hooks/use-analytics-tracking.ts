import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function useAnalyticsTracking() {
  const { toast } = useToast()

  const trackEvent = useCallback(async (
    name: string,
    properties?: Record<string, any>
  ) => {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          properties,
        }),
      })
    } catch (error) {
      console.error('Failed to track analytics event:', error)
      toast({
        title: 'Error',
        description: 'Failed to track event',
        variant: 'destructive',
      })
    }
  }, [toast])

  const trackPageView = useCallback(async (
    path: string,
    properties?: Record<string, any>
  ) => {
    await trackEvent('page_view', {
      path,
      ...properties,
    })
  }, [trackEvent])

  return { trackEvent, trackPageView }
}