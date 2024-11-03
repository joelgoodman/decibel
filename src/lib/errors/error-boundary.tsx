import { Component, type ReactNode } from 'react'
import { ErrorView } from '@/components/errors/error-view'
import { captureError } from '@/lib/errors/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error) {
    captureError(error, {
      severity: 'high',
      context: {
        componentStack: error.stack,
      },
    })
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorView error={this.state.error} />
    }

    return this.props.children
  }
}