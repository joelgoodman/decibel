import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { ProfileForm } from './profile-form'
import { SubscriptionManager } from './subscription-manager'
import { PaymentSettings } from './payment-settings'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    subscription?: {
      status: string
      plan: string
      currentPeriod: Date
    }
  }
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileForm user={user} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionManager 
              subscription={user.subscription}
              onSuccess={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <PaymentSettings userId={user.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}