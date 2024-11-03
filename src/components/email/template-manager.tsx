import { useState } from 'react'
import { useTemplates } from '@/hooks/queries/use-templates'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TemplateList } from './template-list'
import { TemplateEditor } from './template-editor'

export function TemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const { data: templates, isLoading } = useTemplates()

  const handleCreate = () => {
    setSelectedTemplate(null)
    setIsEditorOpen(true)
  }

  const handleEdit = (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsEditorOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <TemplateList
        templates={templates || []}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <TemplateEditor
        templateId={selectedTemplate}
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
      />
    </div>
  )
}