import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureError } from '@/lib/errors/monitoring'

interface ErrorViewProps {
  error?: Error
  resetError?: () => void
}

export function ErrorView({ error, resetError }: ErrorViewProps) {
  useEffect(() => {
    if (error) {
      captureError(error)
    }
  }, [error])

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {resetError && (
        <Button onClick={resetError}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}