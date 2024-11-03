import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface SubscriptionStatusProps {
  subscription?: {
    status: string
    plan: string
    currentPeriodEnd: Date
  }
  onUpgrade: () => void
  onManage: () => void
}

export function SubscriptionStatus({ subscription, onUpgrade, onManage }: SubscriptionStatusProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Subscription Status</h2>
          <div className="mt-2 space-y-1">
            {subscription ? (
              <>
                <div className="flex items-center space-x-2">
                  <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {subscription.plan}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Next billing date: {format(subscription.currentPeriodEnd, 'PP')}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No active subscription</p>
            )}
          </div>
        </div>
        <Button
          onClick={subscription ? onManage : onUpgrade}
          variant={subscription ? 'outline' : 'default'}
        >
          {subscription ? 'Manage Subscription' : 'Upgrade'}
        </Button>
      </div>
    </Card>
  )
}