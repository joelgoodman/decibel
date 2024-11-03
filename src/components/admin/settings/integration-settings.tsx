import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useSettings } from '@/hooks/queries/use-settings'

const integrationSettingsSchema = z.object({
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'ses']),
    from: z.string().email(),
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      username: z.string(),
      password: z.string(),
      secure: z.boolean(),
    }).optional(),
    sendgrid: z.object({
      apiKey: z.string(),
    }).optional(),
    ses: z.object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string(),
    }).optional(),
  }),
  search: z.object({
    provider: z.enum(['algolia', 'meilisearch']),
    algolia: z.object({
      appId: z.string(),
      apiKey: z.string(),
      searchKey: z.string(),
    }).optional(),
    meilisearch: z.object({
      host: z.string(),
      apiKey: z.string(),
    }).optional(),
  }),
  monitoring: z.object({
    sentry: z.object({
      enabled: z.boolean(),
      dsn: z.string().optional(),
    }),
  }),
})

type IntegrationSettingsValues = z.infer<typeof integrationSettingsSchema>

export function IntegrationSettings() {
  const { data: settings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<IntegrationSettingsValues>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: settings?.integrations,
  })

  const onSubmit = async (data: IntegrationSettingsValues) => {
    try {
      await fetch('/api/admin/settings/integrations', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'Integration settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) return null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Email Provider</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="emailProvider">Provider</Label>
            <select
              id="emailProvider"
              {...form.register('email.provider')}
              className="form-select"
            >
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="ses">Amazon SES</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emailFrom">From Address</Label>
            <Input
              id="emailFrom"
              type="email"
              {...form.register('email.from')}
            />
          </div>

          {/* Provider-specific settings */}
          {form.watch('email.provider') === 'smtp' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  {...form.register('email.smtp.host')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  {...form.register('email.smtp.port', { valueAsNumber: true })}
                />
              </div>
              {/* Add other SMTP fields */}
            </div>
          )}

          {form.watch('email.provider') === 'sendgrid' && (
            <div className="grid gap-2">
              <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
              <Input
                id="sendgridApiKey"
                type="password"
                {...form.register('email.sendgrid.apiKey')}
              />
            </div>
          )}

          {form.watch('email.provider') === 'ses' && (
            <div className="space-y-4">
              {/* Add SES fields */}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Search Integration</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="searchProvider">Search Provider</Label>
            <select
              id="searchProvider"
              {...form.register('search.provider')}
              className="form-select"
            >
              <option value="algolia">Algolia</option>
              <option value="meilisearch">Meilisearch</option>
            </select>
          </div>

          {form.watch('search.provider') === 'algolia' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="algoliaAppId">Application ID</Label>
                <Input
                  id="algoliaAppId"
                  {...form.register('search.algolia.appId')}
                />
              </div>
              {/* Add other Algolia fields */}
            </div>
          )}

          {form.watch('search.provider') === 'meilisearch' && (
            <div className="space-y-4">
              {/* Add Meilisearch fields */}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Error Monitoring</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="sentryEnabled"
              checked={form.watch('monitoring.sentry.enabled')}
              onCheckedChange={(checked) => form.setValue('monitoring.sentry.enabled', checked)}
            />
            <Label htmlFor="sentryEnabled">Enable Sentry Error Tracking</Label>
          </div>

          {form.watch('monitoring.sentry.enabled') && (
            <div className="grid gap-2">
              <Label htmlFor="sentryDsn">Sentry DSN</Label>
              <Input
                id="sentryDsn"
                {...form.register('monitoring.sentry.dsn')}
              />
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}