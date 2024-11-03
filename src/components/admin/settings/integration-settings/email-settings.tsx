import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { type IntegrationSettings } from '@/types/settings'

export function EmailSettings() {
  const { register, watch } = useFormContext<IntegrationSettings>()
  const emailProvider = watch('email.provider')

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Email Provider</h2>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="emailProvider">Provider</Label>
          <Select
            id="emailProvider"
            {...register('email.provider')}
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="ses">Amazon SES</option>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="emailFrom">From Address</Label>
          <Input
            id="emailFrom"
            type="email"
            {...register('email.from')}
          />
        </div>

        {emailProvider === 'smtp' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                {...register('email.smtp.host')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                {...register('email.smtp.port', { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpUsername">Username</Label>
              <Input
                id="smtpUsername"
                {...register('email.smtp.username')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPassword">Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                {...register('email.smtp.password')}
              />
            </div>
          </div>
        )}

        {emailProvider === 'sendgrid' && (
          <div className="grid gap-2">
            <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
            <Input
              id="sendgridApiKey"
              type="password"
              {...register('email.sendgrid.apiKey')}
            />
          </div>
        )}

        {emailProvider === 'ses' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sesAccessKeyId">Access Key ID</Label>
              <Input
                id="sesAccessKeyId"
                {...register('email.ses.accessKeyId')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sesSecretAccessKey">Secret Access Key</Label>
              <Input
                id="sesSecretAccessKey"
                type="password"
                {...register('email.ses.secretAccessKey')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sesRegion">Region</Label>
              <Input
                id="sesRegion"
                {...register('email.ses.region')}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}