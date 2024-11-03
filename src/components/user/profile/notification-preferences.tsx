import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface NotificationPreferencesProps {
  settings: NotificationSetting[]
  onSettingChange: (id: string, enabled: boolean) => void
}

export function NotificationPreferences({ settings, onSettingChange }: NotificationPreferencesProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-start space-x-3">
            <Switch
              id={setting.id}
              checked={setting.enabled}
              onCheckedChange={(checked) => onSettingChange(setting.id, checked)}
              aria-label={setting.label}
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor={setting.id} className="font-medium">
                {setting.label}
              </Label>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}