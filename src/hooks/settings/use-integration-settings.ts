import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { IntegrationSettings } from '@/types/settings'

export function useIntegrationSettings() {
  const queryClient = useQueryClient()

  const { mutate: updateSettings, isLoading } = useMutation({
    mutationFn: async (settings: IntegrationSettings) => {
      const response = await fetch('/api/admin/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
      toast({
        title: 'Settings saved',
        description: 'Integration settings have been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    },
  })

  return {
    updateSettings,
    isLoading,
  }
}