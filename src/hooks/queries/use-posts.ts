import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { fetchWithDeduplication } from '@/lib/api/request-manager'
import { debounce } from '@/lib/api/request-manager'

interface PostsQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  tagId?: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  authorId: string
  createdAt: string
  updatedAt: string
}

interface PostsResponse {
  posts: Post[]
  nextCursor?: string
  hasMore: boolean
}

// Debounced search function
const debouncedFetch = debounce(
  (url: string) => fetchWithDeduplication<PostsResponse>(url),
  300
)

export function usePosts(params: PostsQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams({
        ...params,
        cursor: pageParam,
      } as any)

      const url = `/api/posts?${searchParams.toString()}`
      
      // Use debounced fetch for search queries
      if (params.search) {
        return debouncedFetch(url)
      }

      // Use regular deduped fetch for non-search queries
      return fetchWithDeduplication<PostsResponse>(url)
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    keepPreviousData: true,
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchWithDeduplication<Post>(`/api/posts/${id}`),
    enabled: !!id,
  })
}

// Batch fetch multiple posts
export function usePosts(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.posts.list({ ids }),
    queryFn: () => batchManager.add(ids.join(',')),
    enabled: ids.length > 0,
  })
}