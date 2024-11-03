import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useSubscription } from '@/hooks/mutations/use-subscription'

interface SubscriptionManagerProps {
  subscription?: {
    status: string
    plan: string
    currentPeriod: Date
  }
  onSuccess: () => void
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9/month',
    features: ['Access to all articles', 'Basic support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19/month',
    features: ['Access to all content', 'Priority support', 'Early access'],
  },
]

export function SubscriptionManager({ subscription, onSuccess }: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { toast } = useToast()
  const { mutate: updateSubscription, isLoading } = useSubscription()

  const handleSubscribe = async (planId: string) => {
    updateSubscription(planId, {
      onSuccess: () => {
        toast({
          title: 'Subscription updated',
          description: 'Your subscription has been updated successfully.',
        })
        onSuccess()
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      {subscription && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              {subscription.plan} ·{' '}
              <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                {subscription.status}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Next billing date:{' '}
              {format(new Date(subscription.currentPeriod), 'PP')}
            </p>
          </div>
          <Button variant="outline" onClick={() => handleSubscribe('cancel')}>
            Cancel Subscription
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <span className="text-lg font-normal">{plan.price}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-4"
                disabled={isLoading}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}