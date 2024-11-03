import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { type IntegrationSettings } from '@/types/settings'

export function SearchSettings() {
  const { register, watch } = useFormContext<IntegrationSettings>()
  const searchProvider = watch('search.provider')

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Search Integration</h2>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="searchProvider">Search Provider</Label>
          <Select
            id="searchProvider"
            {...register('search.provider')}
          >
            <option value="algolia">Algolia</option>
            <option value="meilisearch">Meilisearch</option>
          </Select>
        </div>

        {searchProvider === 'algolia' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="algoliaAppId">Application ID</Label>
              <Input
                id="algoliaAppId"
                {...register('search.algolia.appId')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="algoliaApiKey">API Key</Label>
              <Input
                id="algoliaApiKey"
                type="password"
                {...register('search.algolia.apiKey')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="algoliaSearchKey">Search Key</Label>
              <Input
                id="algoliaSearchKey"
                {...register('search.algolia.searchKey')}
              />
            </div>
          </div>
        )}

        {searchProvider === 'meilisearch' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="meilisearchHost">Host</Label>
              <Input
                id="meilisearchHost"
                {...register('search.meilisearch.host')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meilisearchApiKey">API Key</Label>
              <Input
                id="meilisearchApiKey"
                type="password"
                {...register('search.meilisearch.apiKey')}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}