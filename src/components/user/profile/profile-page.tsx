import { useState } from 'react'
import { ProfileHeader } from './profile-header'
import { SubscriptionStatus } from './subscription-status'
import { ActivityLog } from './activity-log'
import { NotificationPreferences } from './notification-preferences'
import { ProfileModal } from '../profile-modal'
import { useUser } from '@/hooks/queries/use-user'
import { useUserActivities } from '@/hooks/queries/use-user-activities'
import { useNotificationSettings } from '@/hooks/queries/use-notification-settings'

export function ProfilePage() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { data: user, isLoading: isLoadingUser } = useUser()
  const { data: activities } = useUserActivities()
  const { data: notificationSettings, mutate: updateNotificationSetting } = useNotificationSettings()

  if (isLoadingUser) return null

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <ProfileHeader
        user={user}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatus
          subscription={user.subscription}
          onUpgrade={() => setSettingsOpen(true)}
          onManage={() => setSettingsOpen(true)}
        />

        <NotificationPreferences
          settings={notificationSettings || []}
          onSettingChange={updateNotificationSetting}
        />
      </div>

      <ActivityLog activities={activities || []} />

      <ProfileModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
    </div>
  )
}