import { Fragment } from 'react'
import { useInView } from 'react-intersection-observer'
import { usePosts } from '@/hooks/queries/use-posts'
import { PostCard } from './post-card'
import { VirtualList } from '@/components/ui/virtual-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface PostListProps {
  categoryId?: string
  tagId?: string
}

export function PostList({ categoryId, tagId }: PostListProps) {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = usePosts({
    limit: 10,
    categoryId,
    tagId,
  })

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
      <VirtualList
        items={allPosts}
        estimateSize={200}
        className="h-[800px]"
        renderItem={(post) => <PostCard key={post.id} post={post} />}
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
}