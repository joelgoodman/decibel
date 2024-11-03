import { Analytics } from '@vercel/analytics/react'
import { prisma } from '../prisma'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
}

export async function trackEvent({ name, properties, userId }: AnalyticsEvent) {
  try {
    // Track in Vercel Analytics
    Analytics.track(name, properties)

    // Store in database
    await prisma.analyticsEvent.create({
      data: {
        name,
        properties,
        userId,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

export async function trackPageView(url: string, userId?: string) {
  await trackEvent({
    name: 'page_view',
    properties: {
      url,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
    userId,
  })
}

export async function trackFeatureUsage(feature: string, userId?: string) {
  await trackEvent({
    name: 'feature_used',
    properties: { feature },
    userId,
  })
}