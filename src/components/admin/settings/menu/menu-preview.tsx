import { useState } from 'react'
import { type MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface MenuPreviewProps {
  items: MenuItem[]
  showIcons?: boolean
  expandable?: boolean
  className?: string
}

export function MenuPreview({
  items,
  showIcons = true,
  expandable = false,
  className,
}: MenuPreviewProps) {
  return (
    <div 
      className={cn("p-4 border rounded-lg bg-white", className)}
      role="region"
      aria-label="Menu preview"
    >
      <nav aria-label="Preview navigation">
        <ul role="menubar" className="space-y-1">
          {items.map((item) => (
            <MenuPreviewItem
              key={item.id}
              item={item}
              showIcons={showIcons}
              expandable={expandable}
            />
          ))}
        </ul>
      </nav>
    </div>
  )
}

interface MenuPreviewItemProps {
  item: MenuItem
  showIcons?: boolean
  expandable?: boolean
}

function MenuPreviewItem({
  item,
  showIcons,
  expandable,
}: MenuPreviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = expandable && item.children?.length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (hasChildren) {
        setIsExpanded(!isExpanded)
      }
    }
  }

  return (
    <li role="none">
      <div className="relative">
        <a
          href="#"
          className={cn(
            "flex items-center px-4 py-2 text-sm rounded-md",
            "hover:bg-gray-100 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
          role="menuitem"
          aria-haspopup={hasChildren}
          aria-expanded={hasChildren ? isExpanded : undefined}
          target={item.target}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute left-0 top-1/2 -translate-y-1/2"
              aria-label={isExpanded ? 'Collapse submenu' : 'Expand submenu'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}

          {showIcons && item.icon && (
            <span className="mr-2 text-gray-500" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </a>

        {hasChildren && isExpanded && (
          <ul
            role="menu"
            aria-label={`Submenu of ${item.label}`}
            className="ml-4 mt-1 space-y-1"
          >
            {item.children.map((child) => (
              <MenuPreviewItem
                key={child.id}
                item={child}
                showIcons={showIcons}
                expandable={expandable}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}