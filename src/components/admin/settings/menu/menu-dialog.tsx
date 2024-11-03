import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MenuForm } from './menu-form'
import { type Menu } from '@/types/menu'

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu
  onSubmit: (menu: Menu) => void
}

export function MenuDialog({
  open,
  onOpenChange,
  menu,
  onSubmit,
}: MenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {menu ? 'Edit Menu' : 'Create Menu'}
          </DialogTitle>
        </DialogHeader>
        <MenuForm
          menu={menu}
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