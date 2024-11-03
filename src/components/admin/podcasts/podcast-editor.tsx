import { useState, useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AudioUploader, type AudioMetadata } from './audio-uploader'
import { CategorySelect } from '../posts/category-select'
import { TagSelect } from '../posts/tag-select'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// ... (schema definition remains the same)

export function PodcastEditor({ podcast, categories, tags }: PodcastEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<PodcastFormValues>({
    resolver: zodResolver(podcastSchema),
    defaultValues: podcast ? {
      // ... (defaultValues remain the same)
    } : {
      // ... (defaultValues remain the same)
    },
  })

  // Focus first input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const onSubmit = async (data: PodcastFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/podcasts/${podcast?.id || 'new'}`, {
        method: podcast ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...(audioMetadata && { metadata: audioMetadata }),
        }),
      })

      if (!response.ok) throw new Error('Failed to save podcast')

      toast({
        title: 'Success',
        description: 'Podcast saved successfully',
        role: 'status',
      })

      router.push('/admin/podcasts')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save podcast',
        variant: 'destructive',
        role: 'alert',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="space-y-8"
      aria-label={`${podcast ? 'Edit' : 'Create'} podcast form`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" tabIndex={-1}>
          {podcast ? 'Edit Podcast' : 'New Podcast'}
        </h1>
        <div className="flex space-x-2">
          <Button
            type="submit"
            variant="outline"
            onClick={() => form.setValue('published', false)}
            disabled={isSubmitting}
            aria-label="Save as draft"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save Draft
          </Button>
          <Button
            type="submit"
            onClick={() => form.setValue('published', true)}
            disabled={isSubmitting}
            aria-label="Publish podcast"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Publish
          </Button>
        </div>
      </div>

      <div 
        className="grid gap-8 md:grid-cols-2"
        role="group"
        aria-label="Podcast details"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="required">Title</Label>
            <Input
              id="title"
              ref={titleInputRef}
              {...form.register('title')}
              aria-invalid={!!form.formState.errors.title}
              aria-describedby={form.formState.errors.title ? 'title-error' : undefined}
            />
            {form.formState.errors.title && (
              <p id="title-error" className="text-sm text-red-500" role="alert">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* ... (similar accessibility improvements for other form fields) ... */}

          <div className="flex items-center space-x-2">
            <Switch
              id="explicit"
              checked={form.watch('explicit')}
              onCheckedChange={(checked) => form.setValue('explicit', checked)}
              aria-describedby="explicit-description"
            />
            <Label htmlFor="explicit">Explicit Content</Label>
            <p id="explicit-description" className="text-sm text-gray-500">
              Mark this podcast as containing explicit content
            </p>
          </div>
        </div>

        {/* ... (rest of the form with similar accessibility improvements) ... */}
      </div>
    </form>
  )
}