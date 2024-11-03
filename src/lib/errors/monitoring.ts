import { type AppError, type ErrorSeverity } from './types'

interface ErrorMetadata {
  severity?: ErrorSeverity
  context?: Record<string, unknown>
  tags?: string[]
}

export async function captureError(
  error: Error | AppError,
  metadata?: ErrorMetadata
) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', {
      error,
      metadata,
    })
    return
  }

  // TODO: Integrate with error tracking service (e.g., Sentry)
  try {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity: metadata?.severity || 'medium',
      context: {
        ...(metadata?.context || {}),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString(),
      },
      tags: metadata?.tags || [],
    }

    // Send to your error tracking service
    console.error('Production error:', errorData)
  } catch (e) {
    // Fallback logging if error tracking fails
    console.error('Failed to capture error:', e)
  }
}