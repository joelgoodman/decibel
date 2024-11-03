interface RetryConfig {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

export function retryWithBackoff(
  failureCount: number,
  error: any,
  { 
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
  }: RetryConfig = {}
): false | number {
  // Don't retry if we've hit the max retries
  if (failureCount >= maxRetries) {
    return false
  }

  // Don't retry for certain error types
  if (error?.response?.status === 404 || error?.response?.status === 401) {
    return false
  }

  // Calculate delay with exponential backoff
  const delay = Math.min(
    initialDelay * Math.pow(backoffFactor, failureCount),
    maxDelay
  )

  // Add some jitter
  return delay + Math.random() * 100
}