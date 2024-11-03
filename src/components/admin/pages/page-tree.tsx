import { useState } from 'react'
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PageActions } from './page-actions'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PageTreeProps {
  pages: any[]
  isLoading?: boolean
  parentId?: string | null
  level?: number
}

export function PageTree({ pages, isLoading, parentId = null, level = 0 }: PageTreeProps) {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }

  const filteredPages = pages.filter(page => page.parentId === parentId)

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <ul role="group" className="space-y-1">
      {filteredPages.map((page) => (
        <PageTreeItem
          key={page.id}
          page={page}
          level={level}
          expanded={expandedPages.has(page.id)}
          onToggle={() => toggleExpand(page.id)}
          hasChildren={pages.some(p => p.parentId === page.id)}
          allPages={pages}
        />
      ))}
    </ul>
  )
}

interface PageTreeItemProps {
  page: any
  level: number
  expanded: boolean
  onToggle: () => void
  hasChildren: boolean
  allPages: any[]
}

function PageTreeItem({
  page,
  level,
  expanded,
  onToggle,
  hasChildren,
  allPages,
}: PageTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${level * 24}px`,
  }

  return (
    <li ref={setNodeRef} style={style}>
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-md hover:bg-accent",
          "focus-within:ring-2 focus-within:ring-ring"
        )}
        {...attributes}
      >
        <button
          type="button"
          className="p-1 hover:bg-accent rounded-sm"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>

        {hasChildren ? (
          <button
            type="button"
            onClick={onToggle}
            className="p-1 hover:bg-accent rounded-sm"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{page.title}</span>
          <Badge variant={
            page.status === 'published' ? 'success' :
            page.status === 'scheduled' ? 'warning' :
            'secondary'
          }>
            {page.status}
          </Badge>
        </div>

        <PageActions page={page} />
      </div>

      {expanded && hasChildren && (
        <PageTree
          pages={allPages}
          parentId={page.id}
          level={level + 1}
        />
      )}
    </li>
  )
}