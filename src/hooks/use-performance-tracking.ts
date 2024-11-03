import { useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function usePerformanceTracking() {
  const { toast } = useToast()

  const trackMetric = useCallback(async (
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor',
    path: string
  ) => {
    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          value,
          rating,
          path,
          connectionSpeed: (navigator as any).connection?.effectiveType,
          navigationType: performance.getEntriesByType('navigation')[0]?.type,
        }),
      })
    } catch (error) {
      console.error('Failed to track performance metric:', error)
      toast({
        title: 'Error',
        description: 'Failed to track metric',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const value = entry.startTime || entry.value || 0
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good'

        // Rate the metric based on standard thresholds
        switch (entry.name) {
          case 'FCP':
            rating = value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
            break
          case 'LCP':
            rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
            break
          case 'FID':
            rating = value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
            break
          case 'CLS':
            rating = value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor'
            break
          case 'TTFB':
            rating = value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor'
            break
        }

        trackMetric(entry.name, value, rating, window.location.pathname)
      })
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })

    return () => observer.disconnect()
  }, [trackMetric])

  return { trackMetric }
}