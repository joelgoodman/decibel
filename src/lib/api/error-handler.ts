import { NextResponse } from 'next/server'
import { TRPCError } from '@trpc/server'
import { captureError } from '../errors/monitoring'
import { ZodError } from 'zod'

interface ErrorResponse {
  error: {
    message: string
    code?: string
  }
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error)

  // Handle validation errors
  if (error instanceof ZodError) {
    return new NextResponse(
      JSON.stringify({
        error: {
          message: error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    return new NextResponse(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code,
        },
      }),
      {
        status: getHttpStatus(error.code),
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Handle other errors
  captureError(error instanceof Error ? error : new Error('Unknown error'))

  return new NextResponse(
    JSON.stringify({
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

function getHttpStatus(trpcCode: string): number {
  const statusMap: Record<string, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    METHOD_NOT_SUPPORTED: 405,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  }

  return statusMap[trpcCode] || 500
}