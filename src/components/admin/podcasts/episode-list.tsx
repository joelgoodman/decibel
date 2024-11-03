import { useState } from 'react'
import { usePodcastEpisodes } from '@/hooks/queries/use-podcast-episodes'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './episode-columns'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface EpisodeListProps {
  seriesId?: string
}

export function EpisodeList({ seriesId }: EpisodeListProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sort: 'newest',
  })

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePodcastEpisodes({
    seriesId,
    ...filters,
  })

  if (isError) {
    return (
      <div role="alert" className="text-red-600">
        Error: {error.message}
      </div>
    )
  }

  const episodes = data?.pages.flatMap((page) => page.episodes) ?? []

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div 
          className="flex items-center gap-4"
          role="search"
          aria-label="Search and filter episodes"
        >
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
              aria-hidden="true"
            />
            <Input
              placeholder="Search episodes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              aria-label="Search episodes"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </Select>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
            aria-label="Sort episodes"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </Select>
        </div>

        <div role="region" aria-label="Episode list">
          <DataTable
            columns={columns}
            data={episodes}
            isLoading={isLoading}
            pagination={{
              hasNextPage,
              isFetchingNextPage,
              fetchNextPage,
            }}
            aria-busy={isLoading}
            aria-live="polite"
          />
        </div>
      </div>
    </Card>
  )
}