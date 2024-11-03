import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent } from './editor-content'
import { EditorToolbar } from './editor-toolbar'
import { SEOFields } from './seo-fields'
import { useRouter } from 'next/navigation'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-\/]+$/, 'Invalid slug format'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  template: z.string(),
  parentId: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()),
    ogImage: z.string().optional(),
    noIndex: z.boolean(),
    canonical: z.string().optional(),
  }),
})

type PageFormValues = z.infer<typeof pageSchema>

interface PageEditorProps {
  page?: any
  pages?: any[]
}

export function PageEditor({ page, pages = [] }: PageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: page ? {
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt,
      status: page.status,
      template: page.template,
      parentId: page.parentId,
      seo: page.seo || {
        keywords: [],
        noIndex: false,
      },
    } : {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      template: 'default',
      seo: {
        keywords: [],
        noIndex: false,
      },
    },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.getValues('content'),
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML())
    },
  })

  const onSubmit = async (data: PageFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/pages/${page?.id || 'new'}`, {
        method: page ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save page')

      toast({
        title: 'Success',
        description: 'Page saved successfully',
      })

      router.push('/admin/pages')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save page',
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
          {page ? 'Edit Page' : 'New Page'}
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
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <div className="grid gap-2">
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
            <div className="space-y-4">
              <EditorToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Page Settings</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  id="template"
                  {...form.register('template')}
                >
                  <option value="default">Default</option>
                  <option value="landing">Landing Page</option>
                  <option value="sidebar">With Sidebar</option>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parentId">Parent Page</Label>
                <Select
                  id="parentId"
                  {...form.register('parentId')}
                >
                  <option value="">No Parent</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register('excerpt')}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <SEOFields form={form} baseUrl={process.env.NEXT_PUBLIC_APP_URL!} />
          </Card>
        </div>
      </div>
    </form>
  )
}