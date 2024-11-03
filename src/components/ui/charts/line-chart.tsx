import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LineChartProps {
  data: any[]
  xKey: string
  yKey: string
  className?: string
}

export function LineChart({ data, xKey, yKey, className }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tickFormatter={(value) => {
            if (value instanceof Date) {
              return value.toLocaleDateString()
            }
            return value
          }}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => {
            if (value instanceof Date) {
              return value.toLocaleString()
            }
            return value
          }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}