import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Editor } from '@monaco-editor/react'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateFormProps {
  template?: TemplateFormValues
  onSubmit: (data: TemplateFormValues) => void
  onCancel: () => void
}

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template || {
      name: '',
      subject: '',
      content: '',
      variables: [],
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              {...form.register('subject')}
              error={form.formState.errors.subject?.message}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Template Content</Label>
            <div className="h-[400px] border rounded-md">
              <Editor
                defaultLanguage="html"
                value={form.watch('content')}
                onChange={(value) => form.setValue('content', value || '')}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

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