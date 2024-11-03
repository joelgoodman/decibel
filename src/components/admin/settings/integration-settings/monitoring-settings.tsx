import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { type IntegrationSettings } from '@/types/settings'

export function MonitoringSettings() {
  const { register, watch, setValue } = useFormContext<IntegrationSettings>()
  const sentryEnabled = watch('monitoring.sentry.enabled')

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Error Monitoring</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="sentryEnabled"
            checked={sentryEnabled}
            onCheckedChange={(checked) => setValue('monitoring.sentry.enabled', checked)}
          />
          <Label htmlFor="sentryEnabled">Enable Sentry Error Tracking</Label>
        </div>

        {sentryEnabled && (
          <div className="grid gap-2">
            <Label htmlFor="sentryDsn">Sentry DSN</Label>
            <Input
              id="sentryDsn"
              {...register('monitoring.sentry.dsn')}
            />
          </div>
        )}
      </div>
    </Card>
  )
}