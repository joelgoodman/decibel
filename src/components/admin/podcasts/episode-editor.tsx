import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AudioUploader } from './audio-uploader'
import { useRouter } from 'next/navigation'
import { 
  type PodcastEpisode,
  type PodcastEpisodeFormValues,
  podcastEpisodeSchema 
} from '@/types/podcast'

interface EpisodeEditorProps {
  episode?: PodcastEpisode
  seriesId: string
}

export function EpisodeEditor({ episode, seriesId }: EpisodeEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<PodcastEpisodeFormValues>({
    resolver: zodResolver(podcastEpisodeSchema),
    defaultValues: episode ? {
      title: episode.title,
      description: episode.description,
      audioUrl: episode.audioUrl,
      seriesId: episode.seriesId,
      status: episode.status,
      explicit: episode.explicit,
      transcript: episode.transcript,
    } : {
      title: '',
      description: '',
      audioUrl: '',
      seriesId,
      status: 'draft',
      explicit: false,
    },
  })

  const onSubmit = async (data: PodcastEpisodeFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/podcasts/episodes/${episode?.id || 'new'}`, {
        method: episode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save episode')

      toast({
        title: 'Success',
        description: 'Episode saved successfully',
      })

      router.push(`/admin/podcasts/series/${seriesId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save episode',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {episode ? 'Edit Episode' : 'New Episode'}
        </h1>
        <div className="flex space-x-2">
          <Button
            type="submit"
            variant="outline"
            onClick={() => form.setValue('status', 'draft')}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            onClick={() => form.setValue('status', 'published')}
            disabled={isSubmitting}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Episode Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                  rows={4}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <Label>Audio File</Label>
              <AudioUploader
                currentUrl={form.watch('audioUrl')}
                onUploadComplete={(url) => form.setValue('audioUrl', url)}
                onUploadStart={() => {}}
                onUploadEnd={() => {}}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                {...form.register('transcript')}
                rows={10}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Episode Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="explicit"
                  checked={form.watch('explicit')}
                  onCheckedChange={(checked) => form.setValue('explicit', checked)}
                />
                <Label htmlFor="explicit">Explicit Content</Label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}