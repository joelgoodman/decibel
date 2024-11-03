import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '@/lib/utils'
import { usePodcastAnalytics } from '@/hooks/queries/use-podcast-analytics'

export function PodcastAnalytics() {
  const { data, isLoading } = usePodcastAnalytics()

  if (isLoading) return null

  const { overview, listens, downloads } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Episodes</h3>
          <p className="mt-2 text-3xl font-bold">{overview.totalEpisodes}</p>
          <Badge className="mt-1" variant="secondary">
            {overview.publishedEpisodes} Published
          </Badge>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Listens</h3>
          <p className="mt-2 text-3xl font-bold">{formatNumber(overview.totalListens)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.listenTrend > 0 ? '+' : ''}{overview.listenTrend}% vs last month
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Downloads</h3>
          <p className="mt-2 text-3xl font-bold">{formatNumber(overview.totalDownloads)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.downloadTrend > 0 ? '+' : ''}{overview.downloadTrend}% vs last month
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Avg. Listen Time</h3>
          <p className="mt-2 text-3xl font-bold">{overview.avgListenTime}m</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.listenTimeTrend > 0 ? '+' : ''}{overview.listenTimeTrend}% vs last month
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Listens Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={listens}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Downloads Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}