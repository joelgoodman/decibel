import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useSettings } from '@/hooks/queries/use-settings'
import { TemplateManager } from '@/components/email/template-manager'

const newsletterSettingsSchema = z.object({
  enabled: z.boolean(),
  defaultFromName: z.string().min(1, 'From name is required'),
  defaultFromEmail: z.string().email('Invalid email address'),
  subscriptionSettings: z.object({
    doubleOptIn: z.boolean(),
    welcomeEmail: z.boolean(),
    unsubscribeLink: z.boolean(),
    confirmationTemplate: z.string().optional(),
    welcomeTemplate: z.string().optional(),
  }),
  deliverySettings: z.object({
    batchSize: z.number().min(1).max(1000),
    sendInterval: z.number().min(1),
    retryAttempts: z.number().min(0).max(5),
  }),
  smtp: z.object({
    host: z.string().min(1, 'SMTP host is required'),
    port: z.number().min(1, 'Port is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    secure: z.boolean(),
  }),
})

type NewsletterSettingsValues = z.infer<typeof newsletterSettingsSchema>

export function NewsletterSettings() {
  const { data: settings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<NewsletterSettingsValues>({
    resolver: zodResolver(newsletterSettingsSchema),
    defaultValues: settings?.newsletter,
  })

  const onSubmit = async (data: NewsletterSettingsValues) => {
    try {
      await fetch('/api/admin/settings/newsletter', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'Newsletter settings have been updated successfully.',
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
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Newsletter Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={form.watch('enabled')}
                  onCheckedChange={(checked) => form.setValue('enabled', checked)}
                />
                <Label htmlFor="enabled">Enable Newsletter System</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="defaultFromName">Default From Name</Label>
                <Input
                  id="defaultFromName"
                  {...form.register('defaultFromName')}
                  error={form.formState.errors.defaultFromName?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="defaultFromEmail">Default From Email</Label>
                <Input
                  id="defaultFromEmail"
                  type="email"
                  {...form.register('defaultFromEmail')}
                  error={form.formState.errors.defaultFromEmail?.message}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="doubleOptIn"
                  checked={form.watch('subscriptionSettings.doubleOptIn')}
                  onCheckedChange={(checked) => 
                    form.setValue('subscriptionSettings.doubleOptIn', checked)
                  }
                />
                <Label htmlFor="doubleOptIn">Enable Double Opt-in</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="welcomeEmail"
                  checked={form.watch('subscriptionSettings.welcomeEmail')}
                  onCheckedChange={(checked) => 
                    form.setValue('subscriptionSettings.welcomeEmail', checked)
                  }
                />
                <Label htmlFor="welcomeEmail">Send Welcome Email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="unsubscribeLink"
                  checked={form.watch('subscriptionSettings.unsubscribeLink')}
                  onCheckedChange={(checked) => 
                    form.setValue('subscriptionSettings.unsubscribeLink', checked)
                  }
                />
                <Label htmlFor="unsubscribeLink">Include Unsubscribe Link</Label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Settings</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  {...form.register('deliverySettings.batchSize', { valueAsNumber: true })}
                  error={form.formState.errors.deliverySettings?.batchSize?.message}
                />
                <p className="text-sm text-muted-foreground">
                  Number of emails to send in each batch
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sendInterval">Send Interval (seconds)</Label>
                <Input
                  id="sendInterval"
                  type="number"
                  {...form.register('deliverySettings.sendInterval', { valueAsNumber: true })}
                  error={form.formState.errors.deliverySettings?.sendInterval?.message}
                />
                <p className="text-sm text-muted-foreground">
                  Time to wait between sending batches
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  {...form.register('deliverySettings.retryAttempts', { valueAsNumber: true })}
                  error={form.formState.errors.deliverySettings?.retryAttempts?.message}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">SMTP Settings</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  {...form.register('smtp.host')}
                  error={form.formState.errors.smtp?.host?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  {...form.register('smtp.port', { valueAsNumber: true })}
                  error={form.formState.errors.smtp?.port?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtpUsername">Username</Label>
                <Input
                  id="smtpUsername"
                  {...form.register('smtp.username')}
                  error={form.formState.errors.smtp?.username?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtpPassword">Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  {...form.register('smtp.password')}
                  error={form.formState.errors.smtp?.password?.message}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={form.watch('smtp.secure')}
                  onCheckedChange={(checked) => form.setValue('smtp.secure', checked)}
                />
                <Label htmlFor="smtpSecure">Use Secure Connection (TLS)</Label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}