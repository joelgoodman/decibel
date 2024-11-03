import { useState } from 'react'
import { usePages } from '@/hooks/queries/use-pages'
import { PageTree } from './page-tree'
import { PageActions } from './page-actions'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export function PageList() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    template: 'all',
  })

  const {
    data,
    isLoading,
    isError,
    error,
  } = usePages(filters)

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
          aria-label="Search and filter pages"
        >
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
              aria-hidden="true"
            />
            <Input
              placeholder="Search pages..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              aria-label="Search pages"
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
            value={filters.template}
            onValueChange={(value) => setFilters(prev => ({ ...prev, template: value }))}
            aria-label="Filter by template"
          >
            <option value="all">All Templates</option>
            <option value="default">Default</option>
            <option value="landing">Landing</option>
            <option value="sidebar">With Sidebar</option>
          </Select>
        </div>

        <div 
          role="tree" 
          aria-label="Page hierarchy"
          className="mt-4"
        >
          <PageTree 
            pages={data?.pages || []} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  )
}