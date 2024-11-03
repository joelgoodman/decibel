import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useSettings } from '@/hooks/queries/use-settings'

const storageSettingsSchema = z.object({
  provider: z.enum(['local', 's3', 'cloudinary']),
  s3: z.object({
    bucket: z.string(),
    region: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
  }).optional(),
  cloudinary: z.object({
    cloudName: z.string(),
    apiKey: z.string(),
    apiSecret: z.string(),
  }).optional(),
  uploadLimits: z.object({
    maxFileSize: z.number(),
    allowedTypes: z.array(z.string()),
  }),
})

type StorageSettingsValues = z.infer<typeof storageSettingsSchema>

export function StorageSettings() {
  const { data: settings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<StorageSettingsValues>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues: settings?.storage,
  })

  const onSubmit = async (data: StorageSettingsValues) => {
    try {
      await fetch('/api/admin/settings/storage', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'Storage settings have been updated successfully.',
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
        <h2 className="text-lg font-semibold mb-4">Storage Provider</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              id="provider"
              {...form.register('provider')}
            >
              <option value="local">Local Storage</option>
              <option value="s3">Amazon S3</option>
              <option value="cloudinary">Cloudinary</option>
            </Select>
          </div>
        </div>
      </Card>

      {form.watch('provider') === 's3' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Amazon S3 Settings</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="s3Bucket">Bucket Name</Label>
              <Input
                id="s3Bucket"
                {...form.register('s3.bucket')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s3Region">Region</Label>
              <Input
                id="s3Region"
                {...form.register('s3.region')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s3AccessKeyId">Access Key ID</Label>
              <Input
                id="s3AccessKeyId"
                type="password"
                {...form.register('s3.accessKeyId')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s3SecretAccessKey">Secret Access Key</Label>
              <Input
                id="s3SecretAccessKey"
                type="password"
                {...form.register('s3.secretAccessKey')}
              />
            </div>
          </div>
        </Card>
      )}

      {form.watch('provider') === 'cloudinary' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Cloudinary Settings</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cloudinaryName">Cloud Name</Label>
              <Input
                id="cloudinaryName"
                {...form.register('cloudinary.cloudName')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cloudinaryApiKey">API Key</Label>
              <Input
                id="cloudinaryApiKey"
                type="password"
                {...form.register('cloudinary.apiKey')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
              <Input
                id="cloudinaryApiSecret"
                type="password"
                {...form.register('cloudinary.apiSecret')}
              />
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Limits</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              {...form.register('uploadLimits.maxFileSize', { valueAsNumber: true })}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}