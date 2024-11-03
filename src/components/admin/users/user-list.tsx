import { useState } from 'react'
import { useUsers } from '@/hooks/queries/use-users'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { UserFilters } from './user-filters'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportUsers } from '@/lib/admin/export'

export function UserList() {
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    subscriptionStatus: '',
  })

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsers({ filters })

  const handleExport = async () => {
    const csv = await exportUsers(filters)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  const users = data?.pages.flatMap((page) => page.users) ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <UserFilters value={filters} onChange={setFilters} />
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
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