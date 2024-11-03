import { memo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { usePosts } from '@/hooks/queries/use-posts'
import { PostCard } from './post-card'
import { BulkActions } from './bulk-actions'
import { VirtualList } from '@/components/ui/virtual-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface PostListProps {
  categoryId?: string
  tagId?: string
}

export const PostList = memo(function PostList({ categoryId, tagId }: PostListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = usePosts({
    limit: 10,
    categoryId,
    tagId,
  })

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev =>
      selected
        ? [...prev, id]
        : prev.filter(postId => postId !== id)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(
      selected
        ? data?.pages.flatMap(page => page.posts.map(post => post.id)) ?? []
        : []
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error.message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  const allPosts = data.pages.flatMap((page) => page.posts)

  return (
    <div className="space-y-6">
      <BulkActions
        selectedIds={selectedIds}
        onSuccess={refetch}
        onClearSelection={() => setSelectedIds([])}
      />

      <VirtualList
        items={allPosts}
        estimateSize={200}
        className="h-[800px]"
        renderItem={(post) => (
          <PostCard
            key={post.id}
            post={post}
            selected={selectedIds.includes(post.id)}
            onSelect={(selected) => handleSelect(post.id, selected)}
          />
        )}
      />

      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <div className="text-center">
            <Skeleton className="h-10 w-32 mx-auto" />
          </div>
        )}
      </div>

      {hasNextPage && inView && !isFetchingNextPage && (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          className="w-full"
        >
          Load More
        </Button>
      )}
    </div>
  )
})