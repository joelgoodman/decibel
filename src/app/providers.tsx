import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'
import { ThemeProvider } from 'next-themes'
import { TrackingProvider } from './tracking-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TrackingProvider>
          {children}
        </TrackingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}