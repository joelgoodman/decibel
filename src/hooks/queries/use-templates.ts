import { useQuery } from '@tanstack/react-query'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'
import { type EmailTemplate } from '@/lib/email/types'

export function useTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: () => fetchWithErrorHandling<EmailTemplate[]>('/api/email/templates'),
  })
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['email-templates', id],
    queryFn: () => fetchWithErrorHandling<EmailTemplate>(`/api/email/templates/${id}`),
    enabled: !!id,
  })
}