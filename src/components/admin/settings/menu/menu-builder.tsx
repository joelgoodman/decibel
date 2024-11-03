import { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { MenuItemForm } from './menu-item-form'
import { MenuItemCard } from './menu-item-card'
import { Plus, GripVertical } from 'lucide-react'
import { type MenuItem } from '@/types/menu'

interface MenuBuilderProps {
  items: MenuItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (index: number) => void
  onMove: (fromIndex: number, toIndex: number) => void
  maxDepth: number
}

export function MenuBuilder({
  items,
  onAdd,
  onRemove,
  onMove,
  maxDepth,
}: MenuBuilderProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    onMove(result.source.index, result.destination.index)
  }

  const handleAdd = (item: MenuItem) => {
    onAdd(item)
    setShowForm(false)
    // Return focus to add button after closing form
    addButtonRef.current?.focus()
  }

  const handleEdit = (item: MenuItem, index: number) => {
    onRemove(index)
    onAdd({ ...item, id: editingItem?.id })
    setEditingItem(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    // Return focus to add button after canceling
    addButtonRef.current?.focus()
  }

  return (
    <div 
      className="space-y-4"
      role="region"
      aria-label="Menu item builder"
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menu-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
              role="list"
              aria-label="Menu items"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      role="listitem"
                      aria-label={`Menu item: ${item.label}`}
                      aria-grabbed={snapshot.isDragging}
                    >
                      <MenuItemCard
                        item={item}
                        dragHandleProps={provided.dragHandleProps}
                        onEdit={() => setEditingItem(item)}
                        onDelete={() => onRemove(index)}
                        showIcons
                        index={index}
                      >
                        <GripVertical 
                          className="h-4 w-4 text-gray-400"
                          aria-hidden="true"
                        />
                      </MenuItemCard>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showForm && (
        <div role="dialog" aria-label="Add menu item">
          <MenuItemForm
            onSubmit={handleAdd}
            onCancel={handleCancel}
            maxDepth={maxDepth}
          />
        </div>
      )}

      {editingItem && (
        <div role="dialog" aria-label="Edit menu item">
          <MenuItemForm
            item={editingItem}
            onSubmit={(item) => handleEdit(item, items.findIndex(i => i.id === editingItem.id))}
            onCancel={handleCancel}
            maxDepth={maxDepth}
          />
        </div>
      )}

      {!showForm && !editingItem && (
        <Button
          ref={addButtonRef}
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
          aria-label="Add new menu item"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Menu Item
        </Button>
      )}
    </div>
  )
}