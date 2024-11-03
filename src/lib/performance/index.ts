import { prisma } from '@/lib/prisma'

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  path: string
  connectionSpeed?: string
  navigationType?: string
}

export async function trackPerformance(metric: PerformanceMetric) {
  return prisma.performanceMetric.create({
    data: metric,
  })
}

export async function getPerformanceMetrics(options: {
  startDate: Date
  endDate: Date
  path?: string
  metricName?: string
}) {
  const metrics = await prisma.performanceMetric.findMany({
    where: {
      ...(options.path && { path: options.path }),
      ...(options.metricName && { name: options.metricName }),
      createdAt: {
        gte: options.startDate,
        lte: options.endDate,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate performance statistics
  const stats = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = {
        avg: 0,
        min: Infinity,
        max: -Infinity,
        count: 0,
        ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
      }
    }

    const stat = acc[metric.name]
    stat.avg = (stat.avg * stat.count + metric.value) / (stat.count + 1)
    stat.min = Math.min(stat.min, metric.value)
    stat.max = Math.max(stat.max, metric.value)
    stat.count++
    stat.ratings[metric.rating]++

    return acc
  }, {} as Record<string, any>)

  return {
    metrics,
    stats,
  }
}