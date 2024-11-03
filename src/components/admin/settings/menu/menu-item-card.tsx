import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash } from 'lucide-react'
import { type MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils'

interface MenuItemCardProps {
  item: MenuItem
  dragHandleProps?: DraggableProvidedDragHandleProps
  onEdit: () => void
  onDelete: () => void
  showIcons?: boolean
  index: number
  children?: React.ReactNode
}

export function MenuItemCard({
  item,
  dragHandleProps,
  onEdit,
  onDelete,
  showIcons = true,
  index,
  children,
}: MenuItemCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDelete()
    }
  }

  return (
    <Card 
      className={cn(
        "p-3 flex items-center justify-between",
        "hover:shadow-md transition-shadow"
      )}
      tabIndex={0}
      role="button"
      aria-label={`Menu item ${index + 1}: ${item.label}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center space-x-3">
        <div 
          {...dragHandleProps} 
          className="cursor-move"
          role="button"
          aria-label="Drag to reorder"
          tabIndex={0}
        >
          {children}
        </div>

        {showIcons && item.icon && (
          <span className="text-gray-500" aria-hidden="true">
            {item.icon}
          </span>
        )}

        <div>
          <p className="font-medium">{item.label}</p>
          <p 
            className="text-sm text-gray-500"
            aria-label={`Type: ${getItemTypeLabel(item)}`}
          >
            {getItemTypeLabel(item)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${item.label}`}
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={`Delete ${item.label}`}
        >
          <Trash className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}

function getItemTypeLabel(item: MenuItem): string {
  switch (item.type) {
    case 'link':
      return `External Link: ${item.url}`
    case 'page':
      return 'Page Link'
    case 'category':
      return 'Category Link'
    case 'custom':
      return 'Custom Link'
    default:
      return 'Unknown Type'
  }
}