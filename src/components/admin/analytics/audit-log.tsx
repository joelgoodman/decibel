import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { useAuditLogs } from '@/hooks/queries/use-audit-logs'

export function AuditLog() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [entityType, setEntityType] = useState<string>()

  const { data, isLoading } = useAuditLogs({
    startDate: dateRange.from,
    endDate: dateRange.to,
    entityType,
  })

  if (isLoading) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Audit Log</h2>
        <div className="flex items-center gap-4">
          <Select
            value={entityType}
            onValueChange={setEntityType}
            aria-label="Filter by entity type"
          >
            <option value="">All Types</option>
            <option value="post">Posts</option>
            <option value="podcast">Podcasts</option>
            <option value="user">Users</option>
            <option value="settings">Settings</option>
          </Select>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.createdAt), 'PPpp')}</TableCell>
              <TableCell>{log.user.email}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.entityType}</TableCell>
              <TableCell>{log.entityId}</TableCell>
              <TableCell>
                {log.metadata && (
                  <pre className="text-xs">
                    {JSON.stringify(log.metadata, null, 2)}
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