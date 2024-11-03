import { useState } from 'react'
import { usePodcastSeries } from '@/hooks/queries/use-podcast-series'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'

export function SeriesList() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    sort: 'newest',
  })

  const {
    data,
    isLoading,
    isError,
    error,
  } = usePodcastSeries(filters)

  if (isError) {
    return (
      <div role="alert" className="text-red-600">
        Error: {error.message}
      </div>
    )
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div 
          className="flex items-center gap-4"
          role="search"
          aria-label="Search and filter podcast series"
        >
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
              aria-hidden="true"
            />
            <Input
              placeholder="Search series..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              aria-label="Search series"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            aria-label="Filter by status"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </Select>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
            aria-label="Sort series"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </Select>
        </div>

        <div role="region" aria-label="Podcast series list">
          <DataTable
            columns={columns}
            data={data?.series || []}
            isLoading={isLoading}
            aria-busy={isLoading}
            aria-live="polite"
          />
        </div>

        {isLoading && (
          <div 
            className="text-center text-sm text-gray-500"
            aria-live="polite"
          >
            Loading series...
          </div>
        )}

        {data?.series.length === 0 && (
          <div 
            className="text-center text-sm text-gray-500"
            role="status"
          >
            No series found
          </div>
        )}
      </div>
    </Card>
  )
}