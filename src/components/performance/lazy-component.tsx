import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyComponentProps<T> {
  component: LazyExoticComponent<ComponentType<T>>
  props: T
  fallback?: React.ReactNode
}

export function LazyComponent<T>({
  component: Component,
  props,
  fallback = <Skeleton className="h-32 w-full" />,
}: LazyComponentProps<T>) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
}