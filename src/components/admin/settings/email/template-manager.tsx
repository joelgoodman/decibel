import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TemplateList } from './template-list'
import { TemplateEditor } from './template-editor'
import { useTemplates } from '@/hooks/queries/use-templates'
import { type EmailTemplate } from '@prisma/client'

export function TemplateManager() {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const { toast } = useToast()
  const { data: templates, isLoading } = useTemplates()

  const handleCreate = () => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await fetch(`/api/admin/email/templates/${template.id}/duplicate`, {
        method: 'POST',
      })
      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await fetch(`/api/admin/email/templates/${id}`, {
        method: 'DELETE',
      })
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Email Templates</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <TemplateList
        templates={templates || []}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      {isEditorOpen && (
        <TemplateEditor
          template={editingTemplate || undefined}
          onSubmit={async (data) => {
            try {
              await fetch(
                editingTemplate
                  ? `/api/admin/email/templates/${editingTemplate.id}`
                  : '/api/admin/email/templates',
                {
                  method: editingTemplate ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                }
              )
              toast({
                title: 'Success',
                description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
              })
              setIsEditorOpen(false)
            } catch (error) {
              toast({
                title: 'Error',
                description: 'Failed to save template',
                variant: 'destructive',
              })
            }
          }}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  )
}