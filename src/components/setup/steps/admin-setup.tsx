import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthKit } from '@workos-inc/authkit'

const adminSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
})

type AdminFormValues = z.infer<typeof adminSchema>

interface AdminSetupProps {
  onNext: (data: AdminFormValues) => void
}

export function AdminSetup({ onNext }: AdminSetupProps) {
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
  })

  const onSubmit = async (data: AdminFormValues) => {
    try {
      const authKit = new AuthKit(process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!)

      // Create admin user with WorkOS
      const { user } = await authKit.createUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: true,
      })

      // Proceed to next step
      onNext({
        ...data,
        workosId: user.id,
      })
    } catch (error) {
      form.setError('root', {
        message: 'Failed to create admin account',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...form.register('firstName')}
            error={form.formState.errors.firstName?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...form.register('lastName')}
            error={form.formState.errors.lastName?.message}
          />
        </div>
      </div>

      {form.formState.errors.root && (
        <p className="text-sm text-red-500">
          {form.formState.errors.root.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}