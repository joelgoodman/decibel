import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const emailSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid', 'ses']),
  from: z.string().email('Invalid email address'),
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
  notifications: z.object({
    welcomeEmail: z.boolean(),
    passwordReset: z.boolean(),
    newComment: z.boolean(),
  }),
})

type EmailFormValues = z.infer<typeof emailSchema>

interface EmailSetupProps {
  onNext: (data: EmailFormValues) => void
  onBack: () => void
}

export function EmailSetup({ onNext, onBack }: EmailSetupProps) {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
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

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp.port">SMTP Port</Label>
              <Input
                id="smtp.port"
                type="number"
                {...form.register('smtp.port', { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp.username">Username</Label>
              <Input
                id="smtp.username"
                {...form.register('smtp.username')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp.password">Password</Label>
              <Input
                id="smtp.password"
                type="password"
                {...form.register('smtp.password')}
              />
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ses.secretAccessKey">Secret Access Key</Label>
              <Input
                id="ses.secretAccessKey"
                type="password"
                {...form.register('ses.secretAccessKey')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ses.region">Region</Label>
              <Input
                id="ses.region"
                {...form.register('ses.region')}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Email Notifications</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch {...form.register('notifications.welcomeEmail')} />
            <Label>Send welcome email to new users</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch {...form.register('notifications.passwordReset')} />
            <Label>Send password reset notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch {...form.register('notifications.newComment')} />
            <Label>Send new comment notifications</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}