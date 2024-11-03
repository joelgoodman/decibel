import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { MjmlBlockEditor } from './blocks/mjml-block-editor'
import { useTemplate, useCreateTemplate, useUpdateTemplate } from '@/hooks/mutations/use-templates'

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateEditorProps {
  templateId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateEditor({
  templateId,
  open,
  onOpenChange,
}: TemplateEditorProps) {
  const { toast } = useToast()
  const { data: template } = useTemplate(templateId)
  const { mutate: createTemplate, isLoading: isCreating } = useCreateTemplate()
  const { mutate: updateTemplate, isLoading: isUpdating } = useUpdateTemplate()

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      subject: '',
      content: '',
      variables: [],
    },
  })

  useEffect(() => {
    if (template) {
      form.reset(template)
    }
  }, [template, form])

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      if (templateId) {
        await updateTemplate({ id: templateId, ...data })
      } else {
        await createTemplate(data)
      }

      toast({
        title: 'Success',
        description: `Template ${templateId ? 'updated' : 'created'} successfully`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" {...form.register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" {...form.register('subject')} />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <Label>Template Content</Label>
            <MjmlBlockEditor
              initialContent={form.watch('content')}
              onChange={(mjml) => form.setValue('content', mjml)}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {templateId ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}