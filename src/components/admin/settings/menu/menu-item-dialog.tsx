import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MenuItemForm } from './menu-item-form'
import { type MenuItem } from '@/types/menu'

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: MenuItem
  onSubmit: (item: MenuItem) => void
  maxDepth: number
}

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  maxDepth,
}: MenuItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
        </DialogHeader>
        <MenuItemForm
          item={item}
          onSubmit={(data) => {
            onSubmit(data)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
          maxDepth={maxDepth}
        />
      </DialogContent>
    </Dialog>
  )
}