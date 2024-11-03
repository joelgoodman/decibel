import { Suspense } from 'react'
import { PageList } from '@/components/admin/pages/page-list'
import { PageListSkeleton } from '@/components/admin/pages/page-list-skeleton'
import { CreatePageButton } from '@/components/admin/pages/create-page-button'
import { Container } from '@/components/blocks/layout/container'

export default function PagesPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pages</h1>
          <CreatePageButton />
        </div>
        <Suspense fallback={<PageListSkeleton />}>
          <PageList />
        </Suspense>
      </div>
    </Container>
  )
}