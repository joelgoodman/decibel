import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TemplateForm } from './template-form'
import { type EmailTemplate } from '@prisma/client'

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: EmailTemplate
  onSubmit: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>
        <TemplateForm
          template={template}
          onSubmit={(data) => {
            onSubmit(data)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}