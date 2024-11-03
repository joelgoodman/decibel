import { useState, useCallback } from 'react'
import mjml2html from 'mjml'
import { Post } from '@prisma/client'
import { convertPostToMjml } from '@/lib/email/convert'
import { fetchWithErrorHandling } from '@/lib/errors/api-client'

export function useEmailPreview(post: Post) {
  const [mjmlContent, setMjmlContent] = useState(() => convertPostToMjml(post))
  const [htmlContent, setHtmlContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const updateMjml = useCallback((newMjml: string) => {
    setMjmlContent(newMjml)
    try {
      const { html, errors } = mjml2html(newMjml)
      if (errors.length) {
        setError(errors[0].message)
        return
      }
      setHtmlContent(html)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse MJML')
    }
  }, [])

  const sendTestEmail = useCallback(async () => {
    setIsSending(true)
    try {
      await fetchWithErrorHandling('/api/email/test', {
        method: 'POST',
        body: JSON.stringify({
          postId: post.id,
          mjml: mjmlContent,
        }),
      })
    } finally {
      setIsSending(false)
    }
  }, [post.id, mjmlContent])

  // Initialize HTML content
  useEffect(() => {
    updateMjml(mjmlContent)
  }, [])

  return {
    mjmlContent,
    htmlContent,
    updateMjml,
    sendTestEmail,
    isSending,
    error,
  }
}