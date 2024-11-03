import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const settingsSchema = z.object({
  showIcons: z.boolean().default(true),
  expandable: z.boolean().default(false),
  maxDepth: z.number().min(1).max(5).default(3),
  mobileBreakpoint: z.number().default(768),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface MenuSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: SettingsFormValues
  onSubmit: (settings: SettingsFormValues) => void
}

export function MenuSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSubmit,
}: MenuSettingsDialogProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Menu Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showIcons">Show Icons</Label>
            <Switch
              id="showIcons"
              checked={form.watch('showIcons')}
              onCheckedChange={(checked) => form.setValue('showIcons', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="expandable">Expandable Menu</Label>
            <Switch
              id="expandable"
              checked={form.watch('expandable')}
              onCheckedChange={(checked) => form.setValue('expandable', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDepth">Maximum Depth</Label>
            <Input
              id="maxDepth"
              type="number"
              min={1}
              max={5}
              {...form.register('maxDepth', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileBreakpoint">Mobile Breakpoint (px)</Label>
            <Input
              id="mobileBreakpoint"
              type="number"
              {...form.register('mobileBreakpoint', { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}