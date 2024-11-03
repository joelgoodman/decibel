import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await fetchWithErrorHandling('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user'])
    },
  })
}