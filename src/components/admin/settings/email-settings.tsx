import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { TemplateManager } from './email/template-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const emailSettingsSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid', 'ses']),
  from: z.string().email('Invalid email address'),
  smtp: z.object({
    host: z.string().min(1, 'SMTP host is required'),
    port: z.number().min(1, 'Port is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    secure: z.boolean(),
  }).optional(),
  sendgrid: z.object({
    apiKey: z.string().min(1, 'API key is required'),
  }).optional(),
  ses: z.object({
    accessKeyId: z.string().min(1, 'Access key ID is required'),
    secretAccessKey: z.string().min(1, 'Secret access key is required'),
    region: z.string().min(1, 'Region is required'),
  }).optional(),
  notifications: z.object({
    welcomeEmail: z.boolean(),
    passwordReset: z.boolean(),
    newComment: z.boolean(),
  }),
})

type EmailSettingsValues = z.infer<typeof emailSettingsSchema>

export function EmailSettings() {
  const { toast } = useToast()

  const form = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      provider: 'smtp',
      notifications: {
        welcomeEmail: true,
        passwordReset: true,
        newComment: false,
      },
    },
  })

  const provider = form.watch('provider')

  const onSubmit = async (data: EmailSettingsValues) => {
    try {
      await fetch('/api/admin/settings/email', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'Email settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save email settings.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="provider">Email Provider</Label>
                <Select
                  id="provider"
                  {...form.register('provider')}
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="from">From Address</Label>
                <Input
                  id="from"
                  type="email"
                  {...form.register('from')}
                  error={form.formState.errors.from?.message}
                />
              </div>

              {provider === 'smtp' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="smtp.host">SMTP Host</Label>
                    <Input
                      id="smtp.host"
                      {...form.register('smtp.host')}
                      error={form.formState.errors.smtp?.host?.message}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtp.port">SMTP Port</Label>
                    <Input
                      id="smtp.port"
                      type="number"
                      {...form.register('smtp.port', { valueAsNumber: true })}
                      error={form.formState.errors.smtp?.port?.message}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtp.username">Username</Label>
                    <Input
                      id="smtp.username"
                      {...form.register('smtp.username')}
                      error={form.formState.errors.smtp?.username?.message}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtp.password">Password</Label>
                    <Input
                      id="smtp.password"
                      type="password"
                      {...form.register('smtp.password')}
                      error={form.formState.errors.smtp?.password?.message}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp.secure"
                      checked={form.watch('smtp.secure')}
                      onCheckedChange={(checked) => form.setValue('smtp.secure', checked)}
                    />
                    <Label htmlFor="smtp.secure">Use Secure Connection (TLS)</Label>
                  </div>
                </div>
              )}

              {provider === 'sendgrid' && (
                <div className="grid gap-2">
                  <Label htmlFor="sendgrid.apiKey">API Key</Label>
                  <Input
                    id="sendgrid.apiKey"
                    type="password"
                    {...form.register('sendgrid.apiKey')}
                    error={form.formState.errors.sendgrid?.apiKey?.message}
                  />
                </div>
              )}

              {provider === 'ses' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ses.accessKeyId">Access Key ID</Label>
                    <Input
                      id="ses.accessKeyId"
                      {...form.register('ses.accessKeyId')}
                      error={form.formState.errors.ses?.accessKeyId?.message}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ses.secretAccessKey">Secret Access Key</Label>
                    <Input
                      id="ses.secretAccessKey"
                      type="password"
                      {...form.register('ses.secretAccessKey')}
                      error={form.formState.errors.ses?.secretAccessKey?.message}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ses.region">Region</Label>
                    <Input
                      id="ses.region"
                      {...form.register('ses.region')}
                      error={form.formState.errors.ses?.region?.message}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications.welcomeEmail"
                  checked={form.watch('notifications.welcomeEmail')}
                  onCheckedChange={(checked) => form.setValue('notifications.welcomeEmail', checked)}
                />
                <Label htmlFor="notifications.welcomeEmail">Send welcome email to new users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications.passwordReset"
                  checked={form.watch('notifications.passwordReset')}
                  onCheckedChange={(checked) => form.setValue('notifications.passwordReset', checked)}
                />
                <Label htmlFor="notifications.passwordReset">Send password reset notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications.newComment"
                  checked={form.watch('notifications.newComment')}
                  onCheckedChange={(checked) => form.setValue('notifications.newComment', checked)}
                />
                <Label htmlFor="notifications.newComment">Send new comment notifications</Label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="templates">
        <TemplateManager />
      </TabsContent>
    </Tabs>
  )
}