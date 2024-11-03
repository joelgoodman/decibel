export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AppError extends Error {
  code?: string
  status?: number
  severity?: ErrorSeverity
  context?: Record<string, unknown>
}

export interface ErrorResponse {
  error: {
    message: string
    code?: string
    status?: number
  }
}

export class APIError extends Error implements AppError {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public severity: ErrorSeverity = 'medium',
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class NetworkError extends Error implements AppError {
  constructor(
    message: string = 'Network error occurred',
    public severity: ErrorSeverity = 'high'
  ) {
    super(message)
    this.name = 'NetworkError'
    this.code = 'NETWORK_ERROR'
  }
}

export class ValidationError extends Error implements AppError {
  constructor(
    message: string,
    public fields: Record<string, string>,
    public severity: ErrorSeverity = 'low'
  ) {
    super(message)
    this.name = 'ValidationError'
    this.code = 'VALIDATION_ERROR'
  }
}