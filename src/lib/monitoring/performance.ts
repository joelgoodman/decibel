import { WebVitalsMetric } from '@/types/analytics'
import { captureException } from './sentry'

export async function reportWebVitals(metric: WebVitalsMetric) {
  try {
    const body = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      path: window.location.pathname,
    }

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/vitals', blob)
    } else {
      await fetch('/api/analytics/vitals', {
        body: JSON.stringify(body),
        method: 'POST',
        keepalive: true,
      })
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error('Failed to report vitals'))
  }
}

export function measurePageLoad() {
  if (typeof window === 'undefined') return

  const navigationStart = performance.timing.navigationStart
  const loadTime = Date.now() - navigationStart

  reportWebVitals({
    name: 'page-load',
    value: loadTime,
    rating: loadTime < 3000 ? 'good' : loadTime < 6000 ? 'needs-improvement' : 'poor',
    delta: loadTime,
    id: `load-${Date.now()}`,
    navigationType: 'navigate',
  })
}