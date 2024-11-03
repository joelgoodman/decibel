import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type Menu } from '@/types/menu'

interface MenuCardProps {
  menu: Menu
  onSelect: () => void
  onDelete: () => void
}

export function MenuCard({ menu, onSelect, onDelete }: MenuCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{menu.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {menu.location}
            </Badge>
            <span className="text-sm text-gray-500">
              {menu.items.length} items
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelect}
            aria-label={`Edit ${menu.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label={`Delete ${menu.name}`}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}