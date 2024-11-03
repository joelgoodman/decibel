import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ImageUpload } from '@/components/admin/posts/image-upload'
import { useSettings } from '@/hooks/queries/use-settings'

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  contactEmail: z.string().email(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
    facebookPixelId: z.string().optional(),
  }),
})

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>

export function GeneralSettings() {
  const { data: settings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general,
  })

  const onSubmit = async (data: GeneralSettingsValues) => {
    try {
      await fetch('/api/admin/settings/general', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully.',
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
        <h2 className="text-lg font-semibold mb-4">Site Information</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              {...form.register('siteName')}
              error={form.formState.errors.siteName?.message}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              {...form.register('siteDescription')}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Site Logo</Label>
            <ImageUpload
              value={form.watch('logo')}
              onChange={(url) => form.setValue('logo', url)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Favicon</Label>
            <ImageUpload
              value={form.watch('favicon')}
              onChange={(url) => form.setValue('favicon', url)}
              accept="image/x-icon,image/png"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              {...form.register('contactEmail')}
              error={form.formState.errors.contactEmail?.message}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Social Media</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="twitter">Twitter URL</Label>
            <Input
              id="twitter"
              {...form.register('socialLinks.twitter')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              {...form.register('socialLinks.facebook')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              {...form.register('socialLinks.instagram')}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              {...form.register('analytics.googleAnalyticsId')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input
              id="facebookPixelId"
              {...form.register('analytics.facebookPixelId')}
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