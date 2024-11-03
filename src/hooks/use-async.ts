import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { captureError } from '@/lib/errors/monitoring'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const run = useCallback(
    async (promise: Promise<T>, config?: { showError?: boolean }) => {
      setState({ data: null, error: null, isLoading: true })

      try {
        const data = await promise
        setState({ data, error: null, isLoading: false })
        return data
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('An error occurred')
        
        setState({ data: null, error: errorObj, isLoading: false })
        captureError(errorObj)

        if (config?.showError !== false) {
          toast({
            title: 'Error',
            description: errorObj.message,
            variant: 'destructive',
          })
        }

        throw errorObj
      }
    },
    []
  )

  return { ...state, run }
}