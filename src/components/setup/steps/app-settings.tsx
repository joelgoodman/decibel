import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/posts/image-upload'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string(),
  organizationName: z.string().min(1, 'Organization name is required'),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface AppSettingsProps {
  onNext: (data: SettingsFormValues) => void
  onBack: () => void
}

export function AppSettings({ onNext, onBack }: AppSettingsProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      primaryColor: '#2563eb',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input
          id="siteName"
          {...form.register('siteName')}
          error={form.formState.errors.siteName?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteDescription">Site Description</Label>
        <Textarea
          id="siteDescription"
          {...form.register('siteDescription')}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name</Label>
        <Input
          id="organizationName"
          {...form.register('organizationName')}
          error={form.formState.errors.organizationName?.message}
        />
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        <ImageUpload
          value={form.watch('logo')}
          onChange={(url) => form.setValue('logo', url)}
          accept="image/*"
        />
      </div>

      <div className="space-y-2">
        <Label>Favicon</Label>
        <ImageUpload
          value={form.watch('favicon')}
          onChange={(url) => form.setValue('favicon', url)}
          accept="image/x-icon,image/png"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary Color</Label>
        <Input
          id="primaryColor"
          type="color"
          {...form.register('primaryColor')}
          error={form.formState.errors.primaryColor?.message}
        />
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