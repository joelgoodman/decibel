import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { z } from 'zod'
import { Post, Category, Tag, SEO } from '@prisma/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { useAutosave } from '@/hooks/use-autosave'
import { EditorToolbar } from './editor-toolbar'
import { EditorContent } from './editor-content'
import { ImageUpload } from './image-upload'
import { CategorySelect } from './category-select'
import { TagSelect } from './tag-select'
import { SEOFields } from './seo-fields'
import { SaveIndicator } from './save-indicator'

// ... (previous imports and type definitions)

export function PostEditor({ post, categories, tags }: PostEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: post ? {
      // ... (previous defaultValues)
    } : {
      // ... (previous defaultValues)
    },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.getValues('content'),
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML())
    },
  })

  // Autosave functionality
  const savePost = useCallback(async (data: PostFormValues) => {
    try {
      setIsSaving(true)
      // API call to save post
      await fetch(`/api/posts/${post?.id || 'new'}`, {
        method: post ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setLastSaved(new Date())
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }, [post])

  const { isDirty } = useAutosave({
    data: form.watch(),
    onSave: savePost,
    interval: 30000, // 30 seconds
  })

  // Keyboard shortcuts
  useHotkeys([
    ['mod+s', (e) => {
      e.preventDefault()
      form.handleSubmit(savePost)()
    }],
    ['mod+p', (e) => {
      e.preventDefault()
      form.setValue('published', !form.getValues('published'))
      form.handleSubmit(savePost)()
    }],
    ['mod+enter', (e) => {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }],
  ])

  // Prompt before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  async function onSubmit(data: PostFormValues) {
    try {
      setIsSaving(true)
      await savePost(data)
      toast({
        title: 'Success',
        description: 'Post saved successfully',
      })
      router.push('/admin/posts')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {post ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex items-center gap-4">
          <SaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            isDirty={isDirty}
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSaving}
              variant="outline"
              onClick={() => form.setValue('published', false)}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              onClick={() => form.setValue('published', true)}
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* ... (rest of the form content remains the same) ... */}
    </form>
  )
}