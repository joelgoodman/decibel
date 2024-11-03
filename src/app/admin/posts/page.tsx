import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { PostListSkeleton } from '@/components/admin/posts/post-list-skeleton'
import { CreatePostButton } from '@/components/admin/posts/create-post-button'

// Lazy load the PostList component
const PostList = dynamic(
  () => import('@/components/admin/posts/post-list').then(mod => mod.PostList),
  {
    loading: () => <PostListSkeleton />,
    ssr: false, // Disable SSR for admin components
  }
)

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <CreatePostButton />
      </div>
      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  )
}