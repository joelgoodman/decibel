import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface PodcastAnalytics {
  overview: {
    totalEpisodes: number
    publishedEpisodes: number
    totalListens: number
    listenTrend: number
    totalDownloads: number
    downloadTrend: number
    avgListenTime: number
    listenTimeTrend: number
  }
  listens: Array<{
    date: string
    value: number
  }>
  downloads: Array<{
    date: string
    value: number
  }>
}

export function usePodcastAnalytics() {
  return useQuery<PodcastAnalytics>({
    queryKey: ['podcast-analytics'],
    queryFn: () => fetchWithErrorHandling('/api/analytics/podcasts'),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}