import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      return fetchWithErrorHandling('/api/media/upload', {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media'])
    },
  })
}