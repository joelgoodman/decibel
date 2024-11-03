import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Copy, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { type EmailTemplate } from '@prisma/client'

interface TemplateListProps {
  templates: EmailTemplate[]
  onEdit: (template: EmailTemplate) => void
  onDuplicate: (template: EmailTemplate) => void
  onDelete: (id: string) => void
}

export function TemplateList({
  templates,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Variables</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>{template.subject}</TableCell>
            <TableCell>{template.variables.join(', ')}</TableCell>
            <TableCell>{format(new Date(template.updatedAt), 'PP')}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(template)}
                  aria-label={`Edit ${template.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(template)}
                  aria-label={`Duplicate ${template.name}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(template.id)}
                  aria-label={`Delete ${template.name}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}