import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash } from 'lucide-react'

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.array(z.object({
    name: z.string().min(1, 'Permission name is required'),
    enabled: z.boolean().default(false),
  })),
})

const rolesSchema = z.object({
  roles: z.array(roleSchema),
})

type RolesFormValues = z.infer<typeof rolesSchema>

interface RolesSetupProps {
  onNext: (data: RolesFormValues) => void
  onBack: () => void
}

export function RolesSetup({ onNext, onBack }: RolesSetupProps) {
  const form = useForm<RolesFormValues>({
    resolver: zodResolver(rolesSchema),
    defaultValues: {
      roles: [
        {
          name: 'Admin',
          permissions: [
            { name: 'manage_users', enabled: true },
            { name: 'manage_content', enabled: true },
            { name: 'manage_settings', enabled: true },
          ],
        },
        {
          name: 'Editor',
          permissions: [
            { name: 'manage_content', enabled: true },
          ],
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'roles',
  })

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor={`roles.${index}.name`}>Role Name</Label>
              <Input
                id={`roles.${index}.name`}
                {...form.register(`roles.${index}.name`)}
                error={form.formState.errors.roles?.[index]?.name?.message}
              />
            </div>
            {index > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            {form.watch(`roles.${index}.permissions`)?.map((_, permIndex) => (
              <div key={permIndex} className="flex items-center space-x-2">
                <Input
                  {...form.register(`roles.${index}.permissions.${permIndex}.name`)}
                  error={form.formState.errors.roles?.[index]?.permissions?.[permIndex]?.name?.message}
                />
                <Switch
                  {...form.register(`roles.${index}.permissions.${permIndex}.enabled`)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', permissions: [] })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Role
      </Button>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}