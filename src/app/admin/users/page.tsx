import { Suspense } from 'react'
import { UserList } from '@/components/admin/users/user-list'
import { UserListSkeleton } from '@/components/admin/users/user-list-skeleton'
import { UserFilters } from '@/components/admin/users/user-filters'
import { Container } from '@/components/ui/container'

export default function UsersPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
          <UserFilters />
        </div>
        <Suspense fallback={<UserListSkeleton />}>
          <UserList />
        </Suspense>
      </div>
    </Container>
  )
}