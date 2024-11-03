import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { NextRequest } from 'next/server'

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
}

export async function trackEvent(
  req: NextRequest,
  event: AnalyticsEvent
) {
  const session = await getSession(req)
  const userId = event.userId || session?.userId

  return prisma.analyticsEvent.create({
    data: {
      name: event.name,
      properties: event.properties,
      userId,
    },
  })
}

export async function getAnalytics(options: {
  startDate: Date
  endDate: Date
  eventName?: string
  userId?: string
}) {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      ...(options.eventName && { name: options.eventName }),
      ...(options.userId && { userId: options.userId }),
      timestamp: {
        gte: options.startDate,
        lte: options.endDate,
      },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  // Aggregate analytics data
  const aggregates = {
    totalEvents: events.length,
    eventsByName: events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
  }

  return {
    events,
    aggregates,
  }
}