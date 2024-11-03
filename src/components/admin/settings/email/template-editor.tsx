import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Editor } from '@monaco-editor/react'
import { PreviewFrame } from './preview-frame'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateEditorProps {
  template?: TemplateFormValues
  onSubmit: (data: TemplateFormValues) => void
  onCancel: () => void
}

export function TemplateEditor({
  template,
  onSubmit,
  onCancel,
}: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState('edit')
  const [previewHtml, setPreviewHtml] = useState('')
  const { toast } = useToast()

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template || {
      name: '',
      subject: '',
      content: '',
      variables: [],
    },
  })

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/admin/email/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: form.watch('content'),
          variables: {},
        }),
      })

      if (!response.ok) throw new Error('Failed to generate preview')

      const { html } = await response.json()
      setPreviewHtml(html)
      setActiveTab('preview')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate preview',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            {...form.register('subject')}
            error={form.formState.errors.subject?.message}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <Button type="button" variant="outline" onClick={handlePreview}>
            Generate Preview
          </Button>
        </div>

        <TabsContent value="edit" className="border rounded-md">
          <Editor
            height="500px"
            defaultLanguage="html"
            value={form.watch('content')}
            onChange={(value) => form.setValue('content', value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
            }}
          />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewFrame html={previewHtml} className="h-[500px]" />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </form>
  )
}