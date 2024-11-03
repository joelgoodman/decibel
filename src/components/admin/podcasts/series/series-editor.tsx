import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { ImageUpload } from '@/components/admin/posts/image-upload'
import { CategorySelect } from '@/components/admin/posts/category-select'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const seriesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  artwork: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  language: z.string().min(2).max(5),
  explicit: z.boolean().default(false),
  copyright: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  categoryIds: z.array(z.string()),
  settings: z.object({
    defaultArtwork: z.string().optional(),
    defaultExplicit: z.boolean().default(false),
    defaultLanguage: z.string().default('en'),
  }).default({}),
})

type SeriesFormValues = z.infer<typeof seriesSchema>

interface SeriesEditorProps {
  series?: any
  categories: any[]
}

export function SeriesEditor({ series, categories }: SeriesEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: series ? {
      title: series.title,
      description: series.description,
      slug: series.slug,
      artwork: series.artwork,
      author: series.author,
      language: series.language,
      explicit: series.explicit,
      copyright: series.copyright,
      website: series.website,
      categoryIds: series.categories?.map((c: any) => c.id) || [],
      settings: series.settings,
    } : {
      title: '',
      description: '',
      slug: '',
      author: '',
      language: 'en',
      explicit: false,
      categoryIds: [],
      settings: {
        defaultExplicit: false,
        defaultLanguage: 'en',
      },
    },
  })

  const onSubmit = async (data: SeriesFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/podcasts/series/${series?.id || 'new'}`, {
        method: series ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save series')

      toast({
        title: 'Success',
        description: 'Podcast series saved successfully',
      })

      router.push('/admin/podcasts/series')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save podcast series',
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
          {series ? 'Edit Series' : 'New Series'}
        </h1>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Series'}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Series Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  {...form.register('slug')}
                  error={form.formState.errors.slug?.message}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Series Artwork</h2>
            <ImageUpload
              value={form.watch('artwork')}
              onChange={(url) => form.setValue('artwork', url)}
              accept="image/*"
              maxSize={2048576} // 2MB
              aspectRatio="1:1"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Series Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  {...form.register('author')}
                  error={form.formState.errors.author?.message}
                />
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <CategorySelect
                  categories={categories}
                  selected={form.watch('categoryIds')}
                  onSelect={(value) => form.setValue('categoryIds', value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    {...form.register('language')}
                    error={form.formState.errors.language?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright</Label>
                  <Input
                    id="copyright"
                    {...form.register('copyright')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...form.register('website')}
                  error={form.formState.errors.website?.message}
                />
              </div>

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

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Default Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Episode Artwork</Label>
                <ImageUpload
                  value={form.watch('settings.defaultArtwork')}
                  onChange={(url) => form.setValue('settings.defaultArtwork', url)}
                  accept="image/*"
                  maxSize={2048576}
                  aspectRatio="1:1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="defaultExplicit"
                  checked={form.watch('settings.defaultExplicit')}
                  onCheckedChange={(checked) => 
                    form.setValue('settings.defaultExplicit', checked)
                  }
                />
                <Label htmlFor="defaultExplicit">Default Explicit Setting</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Input
                  id="defaultLanguage"
                  {...form.register('settings.defaultLanguage')}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}