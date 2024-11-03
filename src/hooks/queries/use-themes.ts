import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'
import { type Theme } from '@/lib/themes/types'

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: () => fetchWithErrorHandling('/api/admin/themes'),
  })
}

export function useActiveTheme() {
  return useQuery({
    queryKey: ['themes', 'active'],
    queryFn: () => fetchWithErrorHandling('/api/admin/themes/active'),
  })
}

export function useInstallTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (theme: Theme) => {
      return fetchWithErrorHandling('/api/admin/themes', {
        method: 'POST',
        body: JSON.stringify(theme),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['themes'])
    },
  })
}

export function useActivateTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (themeId: string) => {
      return fetchWithErrorHandling('/api/admin/themes/activate', {
        method: 'POST',
        body: JSON.stringify({ themeId }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['themes'])
      queryClient.invalidateQueries(['themes', 'active'])
    },
  })
}

export function useUninstallTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (themeId: string) => {
      return fetchWithErrorHandling(`/api/admin/themes/${themeId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['themes'])
    },
  })
}