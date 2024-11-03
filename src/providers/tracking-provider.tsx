import { createContext, useContext, ReactNode } from 'react'
import { useAuditTracking } from '@/hooks/use-audit-tracking'
import { useAnalyticsTracking } from '@/hooks/use-analytics-tracking'
import { usePerformanceTracking } from '@/hooks/use-performance-tracking'

interface TrackingContextValue {
  audit: ReturnType<typeof useAuditTracking>
  analytics: ReturnType<typeof useAnalyticsTracking>
  performance: ReturnType<typeof usePerformanceTracking>
}

const TrackingContext = createContext<TrackingContextValue | null>(null)

export function TrackingProvider({ children }: { children: ReactNode }) {
  const audit = useAuditTracking()
  const analytics = useAnalyticsTracking()
  const performance = usePerformanceTracking()

  return (
    <TrackingContext.Provider value={{ audit, analytics, performance }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  return context
}