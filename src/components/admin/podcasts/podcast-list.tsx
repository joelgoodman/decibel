import { useState } from 'react'
import { usePodcasts } from '@/hooks/queries/use-podcasts'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportPodcasts } from '@/lib/admin/export'

export function PodcastList() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
  })

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePodcasts({ filters })

  const handleExport = async () => {
    const csv = await exportPodcasts(filters)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'podcasts.csv'
    a.click()
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  const podcasts = data?.pages.flatMap((page) => page.podcasts) ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={podcasts}
        isLoading={isLoading}
        pagination={{
          hasNextPage,
          isFetchingNextPage,
          fetchNextPage,
        }}
      />
    </div>
  )
}