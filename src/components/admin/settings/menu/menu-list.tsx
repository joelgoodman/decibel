import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { type Menu } from '@/types/menu'
import { MenuCard } from './menu-card'

interface MenuListProps {
  menus: Menu[]
  onSelect: (menu: Menu) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function MenuList({
  menus,
  onSelect,
  onDelete,
  onCreate,
}: MenuListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Navigation Menus</h2>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu
        </Button>
      </div>

      <div className="grid gap-4">
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onSelect={() => onSelect(menu)}
            onDelete={() => onDelete(menu.id)}
          />
        ))}
      </div>
    </div>
  )
}