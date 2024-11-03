import { Suspense } from 'react'
import { Container } from '@/components/blocks/layout/container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettings } from '@/components/admin/settings/general-settings'
import { DatabaseSettings } from '@/components/admin/settings/database-settings'
import { EmailSettings } from '@/components/admin/settings/email-settings'
import { MenuSettings } from '@/components/admin/settings/menu-settings'
import { IntegrationSettings } from '@/components/admin/settings/integration-settings'
import { SettingsSkeleton } from '@/components/admin/settings/settings-skeleton'

export default function SettingsPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage your site-wide configurations and preferences
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <Suspense fallback={<SettingsSkeleton />}>
            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>
            <TabsContent value="database">
              <DatabaseSettings />
            </TabsContent>
            <TabsContent value="email">
              <EmailSettings />
            </TabsContent>
            <TabsContent value="menu">
              <MenuSettings />
            </TabsContent>
            <TabsContent value="integrations">
              <IntegrationSettings />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </Container>
  )
}