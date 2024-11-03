import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useVersionHistory(postId: string) {
  return useQuery({
    queryKey: ['versions', postId],
    queryFn: () => fetchWithErrorHandling(`/api/posts/${postId}/versions`),
    enabled: !!postId,
  })
}