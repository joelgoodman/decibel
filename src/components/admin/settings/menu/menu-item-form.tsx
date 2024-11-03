import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { IconPicker } from './icon-picker'
import { type MenuItem } from '@/types/menu'

const menuItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['link', 'page', 'category', 'custom']),
  url: z.string().url().optional(),
  pageId: z.string().optional(),
  categoryId: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  icon: z.string().optional(),
  visibility: z.object({
    loggedIn: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
    devices: z.array(z.enum(['desktop', 'tablet', 'mobile'])).default(['desktop', 'tablet', 'mobile']),
  }),
})

interface MenuItemFormProps {
  item?: MenuItem
  onSubmit: (data: MenuItem) => void
  onCancel: () => void
  maxDepth: number
}

export function MenuItemForm({
  item,
  onSubmit,
  onCancel,
  maxDepth,
}: MenuItemFormProps) {
  const form = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item || {
      type: 'link',
      target: '_self',
      visibility: {
        loggedIn: false,
        roles: [],
        devices: ['desktop', 'tablet', 'mobile'],
      },
    },
  })

  const type = form.watch('type')

  return (
    <Card className="p-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              {...form.register('label')}
              error={form.formState.errors.label?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              {...form.register('type')}
            >
              <option value="link">External Link</option>
              <option value="page">Page</option>
              <option value="category">Category</option>
              <option value="custom">Custom</option>
            </Select>
          </div>
        </div>

        {type === 'link' && (
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              {...form.register('url')}
              error={form.formState.errors.url?.message}
            />
          </div>
        )}

        {type === 'page' && (
          <div className="space-y-2">
            <Label htmlFor="pageId">Page</Label>
            <Select
              id="pageId"
              {...form.register('pageId')}
            >
              {/* Add page options */}
            </Select>
          </div>
        )}

        {type === 'category' && (
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              {...form.register('categoryId')}
            >
              {/* Add category options */}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <IconPicker
            value={form.watch('icon')}
            onChange={(icon) => form.setValue('icon', icon)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Open in</Label>
          <Select
            id="target"
            {...form.register('target')}
          >
            <option value="_self">Same Window</option>
            <option value="_blank">New Window</option>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update' : 'Add'} Item
          </Button>
        </div>
      </form>
    </Card>
  )
}