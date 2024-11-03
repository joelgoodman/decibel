import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface ProfileHeaderProps {
  user: {
    name: string
    email: string
    image?: string
  }
  onSettingsClick: () => void
}

export function ProfileHeader({ user, onSettingsClick }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <Avatar 
          src={user.image} 
          alt={user.name}
          className="h-16 w-16"
          fallback={user.name?.[0] || '?'}
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={onSettingsClick}
        aria-label="Open settings"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  )
}