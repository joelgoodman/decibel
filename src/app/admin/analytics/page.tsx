import { Suspense } from 'react'
import { Container } from '@/components/blocks/layout/container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceMetrics } from '@/components/admin/analytics/performance-metrics'
import { UserActivity } from '@/components/admin/analytics/user-activity'
import { AuditLog } from '@/components/admin/analytics/audit-log'
import { AnalyticsSkeleton } from '@/components/admin/analytics/analytics-skeleton'

export default function AnalyticsPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor site performance, user activity, and system events
          </p>
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <Suspense fallback={<AnalyticsSkeleton />}>
            <TabsContent value="performance">
              <PerformanceMetrics />
            </TabsContent>
            <TabsContent value="activity">
              <UserActivity />
            </TabsContent>
            <TabsContent value="audit">
              <AuditLog />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </Container>
  )
}