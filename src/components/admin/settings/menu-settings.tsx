import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { MenuBuilder } from './menu/menu-builder'
import { MenuPreview } from './menu/menu-preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Save } from 'lucide-react'

const menuItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['link', 'page', 'category', 'custom']),
  url: z.string().url().optional(),
  pageId: z.string().optional(),
  categoryId: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  icon: z.string().optional(),
  children: z.lazy(() => z.array(menuItemSchema)).default([]),
  visibility: z.object({
    loggedIn: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
    devices: z.array(z.enum(['desktop', 'tablet', 'mobile'])).default(['desktop', 'tablet', 'mobile']),
  }),
})

const menuSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Menu name is required'),
  location: z.enum(['header', 'footer', 'sidebar']),
  items: z.array(menuItemSchema),
  settings: z.object({
    showIcons: z.boolean().default(true),
    expandable: z.boolean().default(false),
    maxDepth: z.number().min(1).max(5).default(3),
    mobileBreakpoint: z.number().default(768),
  }),
})

type MenuItem = z.infer<typeof menuItemSchema>
type Menu = z.infer<typeof menuSchema>

export function MenuSettings() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('builder')
  const { toast } = useToast()

  const form = useForm<Menu>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      items: [],
      settings: {
        showIcons: true,
        expandable: false,
        maxDepth: 3,
        mobileBreakpoint: 768,
      },
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onSubmit = async (data: Menu) => {
    try {
      await fetch('/api/admin/settings/menus', {
        method: 'PUT',
        body: JSON.stringify(data),
      })

      toast({
        title: 'Menu saved',
        description: 'Menu configuration has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save menu configuration.',
        variant: 'destructive',
      })
    }
  }

  const handleAddMenu = () => {
    // Implementation for adding a new menu
  }

  const handleDeleteMenu = async (menuId: string) => {
    // Implementation for deleting a menu
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Navigation Menus</h2>
        <Button onClick={handleAddMenu}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 md:col-span-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">Menu Name</Label>
              <Input
                id="menuName"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menuLocation">Location</Label>
              <Select
                id="menuLocation"
                {...form.register('location')}
              >
                <option value="header">Header Navigation</option>
                <option value="footer">Footer Navigation</option>
                <option value="sidebar">Sidebar Navigation</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showIcons">Show Icons</Label>
                  <Switch
                    id="showIcons"
                    checked={form.watch('settings.showIcons')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.showIcons', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="expandable">Expandable</Label>
                  <Switch
                    id="expandable"
                    checked={form.watch('settings.expandable')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.expandable', checked)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="maxDepth">Maximum Depth</Label>
                  <Input
                    id="maxDepth"
                    type="number"
                    min={1}
                    max={5}
                    {...form.register('settings.maxDepth', { 
                      valueAsNumber: true 
                    })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mobileBreakpoint">Mobile Breakpoint (px)</Label>
                  <Input
                    id="mobileBreakpoint"
                    type="number"
                    {...form.register('settings.mobileBreakpoint', { 
                      valueAsNumber: true 
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="builder">Menu Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              <MenuBuilder
                items={fields}
                onAdd={(item) => append(item)}
                onRemove={(index) => remove(index)}
                onMove={(from, to) => move(from, to)}
                maxDepth={form.watch('settings.maxDepth')}
              />
            </TabsContent>

            <TabsContent value="preview">
              <MenuPreview
                items={form.watch('items')}
                showIcons={form.watch('settings.showIcons')}
                expandable={form.watch('settings.expandable')}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}