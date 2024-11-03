import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { type Menu, menuSchema } from '@/types/menu'

interface MenuFormProps {
  menu?: Menu
  onSubmit: (data: Menu) => void
  onCancel: () => void
}

export function MenuForm({ menu, onSubmit, onCancel }: MenuFormProps) {
  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: menu || {
      name: '',
      location: 'header',
      items: [],
      settings: {
        showIcons: true,
        expandable: false,
        maxDepth: 3,
        mobileBreakpoint: 768,
      },
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Menu Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Select
              id="location"
              {...form.register('location')}
            >
              <option value="header">Header Navigation</option>
              <option value="footer">Footer Navigation</option>
              <option value="sidebar">Sidebar Navigation</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {menu ? 'Update' : 'Create'} Menu
        </Button>
      </div>
    </form>
  )
}