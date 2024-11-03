import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useSettings } from '@/hooks/queries/use-settings'

const podcastSettingsSchema = z.object({
  defaultLanguage: z.string(),
  defaultExplicit: z.boolean(),
  audioSettings: z.object({
    maxFileSize: z.number().min(1),
    allowedFormats: z.array(z.string()),
    minBitrate: z.number().min(64),
    maxBitrate: z.number().max(320),
  }),
  rssSettings: z.object({
    enabled: z.boolean(),
    itemsPerFeed: z.number().min(10).max(100),
    includeDraft: z.boolean(),
  }),
  distribution: z.object({
    appleSubmissionUrl: z.string().url().optional(),
    spotifySubmissionUrl: z.string().url().optional(),
    googleSubmissionUrl: z.string().url().optional(),
  }),
})

type PodcastSettingsValues = z.infer<typeof podcastSettingsSchema>

export function PodcastSettings() {
  const { data: settings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<PodcastSettingsValues>({
    resolver: zodResolver(podcastSettingsSchema),
    defaultValues: settings?.podcast,
  })

  const onSubmit = async (data: PodcastSettingsValues) => {
    try {
      await fetch('/api/admin/settings/podcast', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast({
        title: 'Settings saved',
        description: 'Podcast settings have been updated successfully.',
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
        <h2 className="text-lg font-semibold mb-4">Default Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <Select
              id="defaultLanguage"
              {...form.register('defaultLanguage')}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="defaultExplicit"
              checked={form.watch('defaultExplicit')}
              onCheckedChange={(checked) => form.setValue('defaultExplicit', checked)}
            />
            <Label htmlFor="defaultExplicit">Mark new episodes as explicit by default</Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Audio Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              {...form.register('audioSettings.maxFileSize', { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minBitrate">Minimum Bitrate (kbps)</Label>
            <Input
              id="minBitrate"
              type="number"
              {...form.register('audioSettings.minBitrate', { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxBitrate">Maximum Bitrate (kbps)</Label>
            <Input
              id="maxBitrate"
              type="number"
              {...form.register('audioSettings.maxBitrate', { valueAsNumber: true })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">RSS Feed Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="rssEnabled"
              checked={form.watch('rssSettings.enabled')}
              onCheckedChange={(checked) => form.setValue('rssSettings.enabled', checked)}
            />
            <Label htmlFor="rssEnabled">Enable RSS Feeds</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="itemsPerFeed">Items Per Feed</Label>
            <Input
              id="itemsPerFeed"
              type="number"
              {...form.register('rssSettings.itemsPerFeed', { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeDraft"
              checked={form.watch('rssSettings.includeDraft')}
              onCheckedChange={(checked) => form.setValue('rssSettings.includeDraft', checked)}
            />
            <Label htmlFor="includeDraft">Include Draft Episodes</Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Distribution</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="appleSubmissionUrl">Apple Podcasts Submission URL</Label>
            <Input
              id="appleSubmissionUrl"
              {...form.register('distribution.appleSubmissionUrl')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="spotifySubmissionUrl">Spotify Submission URL</Label>
            <Input
              id="spotifySubmissionUrl"
              {...form.register('distribution.spotifySubmissionUrl')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="googleSubmissionUrl">Google Podcasts Submission URL</Label>
            <Input
              id="googleSubmissionUrl"
              {...form.register('distribution.googleSubmissionUrl')}
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