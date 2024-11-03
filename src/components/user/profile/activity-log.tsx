import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

interface Activity {
  id: string
  type: string
  description: string
  timestamp: Date
}

interface ActivityLogProps {
  activities: Activity[]
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start space-x-3 text-sm"
          >
            <div className="flex-shrink-0 w-12 text-gray-500">
              {format(activity.timestamp, 'HH:mm')}
            </div>
            <div>
              <p className="font-medium">{activity.type}</p>
              <p className="text-gray-500">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}