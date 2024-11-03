import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { testDatabaseConnection } from '@/lib/database/connection'

const neonSettingsSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  sslMode: z.enum(['require', 'prefer', 'disable']).default('require'),
})

const supabaseSettingsSchema = z.object({
  projectRef: z.string().min(1, 'Project reference is required'),
  host: z.string().min(1, 'Host is required'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  pooling: z.boolean().default(true),
})

type NeonSettings = z.infer<typeof neonSettingsSchema>
type SupabaseSettings = z.infer<typeof supabaseSettingsSchema>

export function DatabaseSettings() {
  const [activeProvider, setActiveProvider] = useState<'neon' | 'supabase'>('neon')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null)
  const { toast } = useToast()

  const neonForm = useForm<NeonSettings>({
    resolver: zodResolver(neonSettingsSchema),
    defaultValues: {
      sslMode: 'require',
    },
  })

  const supabaseForm = useForm<SupabaseSettings>({
    resolver: zodResolver(supabaseSettingsSchema),
    defaultValues: {
      pooling: true,
    },
  })

  const testConnection = async (provider: 'neon' | 'supabase', data: NeonSettings | SupabaseSettings) => {
    try {
      setIsTestingConnection(true)
      setConnectionStatus(null)

      const connectionString = buildConnectionString(provider, data)
      const result = await testDatabaseConnection(connectionString)

      setConnectionStatus(result.success ? 'success' : 'error')
      
      toast({
        title: result.success ? 'Connection successful' : 'Connection failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      })
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to test connection',
        variant: 'destructive',
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const onSaveNeon = async (data: NeonSettings) => {
    try {
      await fetch('/api/admin/settings/database', {
        method: 'PUT',
        body: JSON.stringify({
          provider: 'neon',
          settings: data,
        }),
      })
      toast({
        title: 'Settings saved',
        description: 'Database settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save database settings.',
        variant: 'destructive',
      })
    }
  }

  const onSaveSupabase = async (data: SupabaseSettings) => {
    try {
      await fetch('/api/admin/settings/database', {
        method: 'PUT',
        body: JSON.stringify({
          provider: 'supabase',
          settings: data,
        }),
      })
      toast({
        title: 'Settings saved',
        description: 'Database settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save database settings.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeProvider} onValueChange={(value) => setActiveProvider(value as 'neon' | 'supabase')}>
        <TabsList>
          <TabsTrigger value="neon">Neon</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
        </TabsList>

        <TabsContent value="neon">
          <Card className="p-6">
            <form onSubmit={neonForm.handleSubmit(onSaveNeon)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="neon-host">Host</Label>
                <Input
                  id="neon-host"
                  {...neonForm.register('host')}
                  placeholder="ep-example.region.aws.neon.tech"
                  error={neonForm.formState.errors.host?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="neon-database">Database</Label>
                <Input
                  id="neon-database"
                  {...neonForm.register('database')}
                  placeholder="neondb"
                  error={neonForm.formState.errors.database?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="neon-username">Username</Label>
                <Input
                  id="neon-username"
                  {...neonForm.register('username')}
                  error={neonForm.formState.errors.username?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="neon-password">Password</Label>
                <Input
                  id="neon-password"
                  type="password"
                  {...neonForm.register('password')}
                  error={neonForm.formState.errors.password?.message}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection('neon', neonForm.getValues())}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : connectionStatus === 'success' ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : connectionStatus === 'error' ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  ) : null}
                  Test Connection
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="supabase">
          <Card className="p-6">
            <form onSubmit={supabaseForm.handleSubmit(onSaveSupabase)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="supabase-project-ref">Project Reference</Label>
                <Input
                  id="supabase-project-ref"
                  {...supabaseForm.register('projectRef')}
                  placeholder="abcdefghijklmnop"
                  error={supabaseForm.formState.errors.projectRef?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supabase-host">Host</Label>
                <Input
                  id="supabase-host"
                  {...supabaseForm.register('host')}
                  placeholder="aws-0-region.pooler.supabase.com"
                  error={supabaseForm.formState.errors.host?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supabase-database">Database</Label>
                <Input
                  id="supabase-database"
                  {...supabaseForm.register('database')}
                  placeholder="postgres"
                  error={supabaseForm.formState.errors.database?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supabase-username">Username</Label>
                <Input
                  id="supabase-username"
                  {...supabaseForm.register('username')}
                  error={supabaseForm.formState.errors.username?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supabase-password">Password</Label>
                <Input
                  id="supabase-password"
                  type="password"
                  {...supabaseForm.register('password')}
                  error={supabaseForm.formState.errors.password?.message}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection('supabase', supabaseForm.getValues())}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : connectionStatus === 'success' ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : connectionStatus === 'error' ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  ) : null}
                  Test Connection
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}