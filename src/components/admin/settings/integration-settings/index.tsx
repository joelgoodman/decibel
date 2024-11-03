import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/queries/use-settings'
import { useIntegrationSettings } from '@/hooks/settings/use-integration-settings'
import { EmailSettings } from './email-settings'
import { SearchSettings } from './search-settings'
import { MonitoringSettings } from './monitoring-settings'
import { 
  type IntegrationSettings as IntegrationSettingsType,
  integrationSettingsSchema 
} from '@/types/settings'

export function IntegrationSettings() {
  const { data: settings, isLoading: isLoadingSettings } = useSettings()
  const { updateSettings, isLoading: isUpdating } = useIntegrationSettings()

  const methods = useForm<IntegrationSettingsType>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: settings?.integrations,
  })

  const onSubmit = (data: IntegrationSettingsType) => {
    updateSettings(data)
  }

  if (isLoadingSettings) return null

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <EmailSettings />
        <SearchSettings />
        <MonitoringSettings />

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}