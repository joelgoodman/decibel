import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeList } from './theme/theme-list'
import { ThemeUploader } from './theme/theme-uploader'
import { ThemeEditor } from './theme/theme-editor'
import { useThemes } from '@/hooks/queries/use-themes'

export function ThemeSettings() {
  const [activeTab, setActiveTab] = useState('installed')
  const { data: themes, isLoading } = useThemes()
  const { toast } = useToast()

  const handleActivate = async (themeId: string) => {
    try {
      await fetch('/api/admin/themes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId }),
      })

      toast({
        title: 'Theme activated',
        description: 'The theme has been activated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate theme',
        variant: 'destructive',
      })
    }
  }

  const handleUninstall = async (themeId: string) => {
    try {
      await fetch(`/api/admin/themes/${themeId}`, {
        method: 'DELETE',
      })

      toast({
        title: 'Theme uninstalled',
        description: 'The theme has been uninstalled successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to uninstall theme',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="installed">Installed Themes</TabsTrigger>
          <TabsTrigger value="upload">Upload Theme</TabsTrigger>
          <TabsTrigger value="editor">Theme Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="installed">
          <Card className="p-6">
            <ThemeList
              themes={themes || []}
              isLoading={isLoading}
              onActivate={handleActivate}
              onUninstall={handleUninstall}
            />
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card className="p-6">
            <ThemeUploader />
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <Card className="p-6">
            <ThemeEditor />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}