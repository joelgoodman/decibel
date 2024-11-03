import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { MenuList } from './menu-list'
import { MenuDialog } from './menu-dialog'
import { MenuBuilder } from './menu-builder'
import { type Menu } from '@/types/menu'

export function MenuManager() {
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const { toast } = useToast()

  const handleCreate = () => {
    setSelectedMenu(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsBuilderOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return

    try {
      await fetch(`/api/admin/menus/${id}`, {
        method: 'DELETE',
      })
      toast({
        title: 'Success',
        description: 'Menu deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete menu',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Navigation Menus</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </Button>
      </div>

      <MenuList
        onSelect={handleEdit}
        onDelete={handleDelete}
      />

      <MenuDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        menu={selectedMenu}
        onSubmit={async (data) => {
          try {
            await fetch(
              selectedMenu
                ? `/api/admin/menus/${selectedMenu.id}`
                : '/api/admin/menus',
              {
                method: selectedMenu ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              }
            )
            toast({
              title: 'Success',
              description: `Menu ${selectedMenu ? 'updated' : 'created'} successfully`,
            })
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to save menu',
              variant: 'destructive',
            })
          }
        }}
      />

      {selectedMenu && isBuilderOpen && (
        <MenuBuilder
          menu={selectedMenu}
          onClose={() => setIsBuilderOpen(false)}
          onSave={async (items) => {
            try {
              await fetch(`/api/admin/menus/${selectedMenu.id}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
              })
              toast({
                title: 'Success',
                description: 'Menu items updated successfully',
              })
              setIsBuilderOpen(false)
            } catch (error) {
              toast({
                title: 'Error',
                description: 'Failed to save menu items',
                variant: 'destructive',
              })
            }
          }}
        />
      )}
    </div>
  )
}