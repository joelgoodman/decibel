import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface CompletionStepProps {
  onComplete: () => void
  onBack: () => void
}

export function CompletionStep({ onComplete, onBack }: CompletionStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-gray-500">
          Your application has been configured successfully. You can now access the admin dashboard.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete}>Go to Dashboard</Button>
      </div>
    </div>
  )
}