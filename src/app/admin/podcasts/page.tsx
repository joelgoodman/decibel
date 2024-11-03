import { Suspense } from 'react'
import { PodcastList } from '@/components/admin/podcasts/podcast-list'
import { PodcastListSkeleton } from '@/components/admin/podcasts/podcast-list-skeleton'
import { CreatePodcastButton } from '@/components/admin/podcasts/create-podcast-button'
import { Container } from '@/components/blocks/layout/container'

export default function PodcastsPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Podcasts</h1>
          <CreatePodcastButton />
        </div>
        <Suspense fallback={<PodcastListSkeleton />}>
          <PodcastList />
        </Suspense>
      </div>
    </Container>
  )
}