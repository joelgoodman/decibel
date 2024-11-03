import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </Card>
  )
}