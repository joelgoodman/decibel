import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals'
import { captureError } from '../errors/monitoring'

const vitalsUrl = '/api/vitals'

function getConnectionSpeed() {
  if (!navigator.connection) return 'unknown'
  return (navigator.connection as any).effectiveType || 'unknown'
}

async function sendToAnalytics(metric: any, options: any) {
  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: options.getNavigationType(),
    path: window.location.pathname,
    connectionSpeed: getConnectionSpeed(),
  }

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon(vitalsUrl, blob)
    } else {
      await fetch(vitalsUrl, {
        body: JSON.stringify(body),
        method: 'POST',
        keepalive: true,
      })
    }
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('Failed to send vitals'))
  }
}

export function reportWebVitals() {
  try {
    onFID((metric) => sendToAnalytics(metric, { getNavigationType: () => 'FID' }))
    onTTFB((metric) => sendToAnalytics(metric, { getNavigationType: () => 'TTFB' }))
    onLCP((metric) => sendToAnalytics(metric, { getNavigationType: () => 'LCP' }))
    onCLS((metric) => sendToAnalytics(metric, { getNavigationType: () => 'CLS' }))
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('Failed to initialize web vitals'))
  }
}