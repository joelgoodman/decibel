import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { useUserActivity } from '@/hooks/queries/use-user-activity'

export function UserActivity() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const { data, isLoading } = useUserActivity({
    startDate: dateRange.from,
    endDate: dateRange.to,
  })

  if (isLoading) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">User Activity</h2>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Total Events</p>
          <p className="text-2xl font-bold mt-1">{data?.aggregates.totalEvents}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Unique Users</p>
          <p className="text-2xl font-bold mt-1">{data?.aggregates.uniqueUsers}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Most Common Event</p>
          <p className="text-2xl font-bold mt-1">
            {Object.entries(data?.aggregates.eventsByName || {}).sort((a, b) => b[1] - a[1])[0]?.[0]}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{format(new Date(event.timestamp), 'PPpp')}</TableCell>
              <TableCell>{event.name}</TableCell>
              <TableCell>{event.user?.email || 'Anonymous'}</TableCell>
              <TableCell>
                {event.properties && (
                  <pre className="text-xs">
                    {JSON.stringify(event.properties, null, 2)}
                  </pre>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}