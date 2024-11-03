import { fetchWithErrorHandling } from '../errors/api-client'

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>()

// Request debouncing
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout
  let pendingPromise: Promise<ReturnType<T>> | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (pendingPromise) return pendingPromise

    pendingPromise = new Promise((resolve, reject) => {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        pendingPromise = null
        Promise.resolve(fn(...args))
          .then(resolve)
          .catch(reject)
      }, wait)
    })

    return pendingPromise
  }
}

// Request batching
interface BatchRequest<T> {
  id: string
  resolve: (value: T) => void
  reject: (error: Error) => void
}

class BatchRequestManager<T> {
  private batch: BatchRequest<T>[] = []
  private timeout: NodeJS.Timeout | null = null

  constructor(
    private batchHandler: (ids: string[]) => Promise<Record<string, T>>,
    private wait: number = 50
  ) {}

  add(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ id, resolve, reject })

      if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), this.wait)
      }
    })
  }

  private async processBatch() {
    const currentBatch = [...this.batch]
    this.batch = []
    this.timeout = null

    try {
      const ids = currentBatch.map(request => request.id)
      const results = await this.batchHandler(ids)

      currentBatch.forEach(request => {
        const result = results[request.id]
        if (result) {
          request.resolve(result)
        } else {
          request.reject(new Error(`No result for id: ${request.id}`))
        }
      })
    } catch (error) {
      currentBatch.forEach(request => {
        request.reject(error instanceof Error ? error : new Error('Batch request failed'))
      })
    }
  }
}

// Deduplicated fetch with caching
export async function fetchWithDeduplication<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const key = `${url}-${JSON.stringify(options)}`
  
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!
  }

  const request = fetchWithErrorHandling<T>(url, options)
  pendingRequests.set(key, request)

  try {
    const response = await request
    return response
  } finally {
    pendingRequests.delete(key)
  }
}

// Export batch request manager instance
export const batchManager = new BatchRequestManager(async (ids: string[]) => {
  const response = await fetchWithErrorHandling<Record<string, any>>(
    `/api/batch?ids=${ids.join(',')}`
  )
  return response
})