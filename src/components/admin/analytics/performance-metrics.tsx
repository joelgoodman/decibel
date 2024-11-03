import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { LineChart } from '@/components/ui/charts/line-chart'
import { usePerformanceMetrics } from '@/hooks/queries/use-performance-metrics'

export function PerformanceMetrics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [metricType, setMetricType] = useState('FCP')

  const { data, isLoading } = usePerformanceMetrics({
    startDate: dateRange.from,
    endDate: dateRange.to,
    metricName: metricType,
  })

  if (isLoading) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Performance Metrics</h2>
        <div className="flex items-center gap-4">
          <Select
            value={metricType}
            onValueChange={setMetricType}
            aria-label="Select metric type"
          >
            <option value="FCP">First Contentful Paint</option>
            <option value="LCP">Largest Contentful Paint</option>
            <option value="FID">First Input Delay</option>
            <option value="CLS">Cumulative Layout Shift</option>
            <option value="TTFB">Time to First Byte</option>
          </Select>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {data?.stats[metricType] && (
            <>
              <MetricCard
                title="Average"
                value={data.stats[metricType].avg.toFixed(2)}
                unit="ms"
              />
              <MetricCard
                title="Minimum"
                value={data.stats[metricType].min.toFixed(2)}
                unit="ms"
              />
              <MetricCard
                title="Maximum"
                value={data.stats[metricType].max.toFixed(2)}
                unit="ms"
              />
              <MetricCard
                title="Total Samples"
                value={data.stats[metricType].count}
              />
            </>
          )}
        </div>

        <div className="h-[400px]">
          <LineChart
            data={data?.metrics.map(m => ({
              date: new Date(m.createdAt),
              value: m.value,
            })) || []}
            xKey="date"
            yKey="value"
          />
        </div>
      </div>
    </Card>
  )
}

function MetricCard({ title, value, unit }: { title: string; value: number | string; unit?: string }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
    </div>
  )
}