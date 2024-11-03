import { useEffect, useState } from 'react'
import { convertToMjml } from '@/lib/email/mjml-converter'
import { PreviewFrame } from '../preview-frame'
import { Skeleton } from '@/components/ui/skeleton'

interface MjmlPreviewProps {
  content: string
}

export function MjmlPreview({ content }: MjmlPreviewProps) {
  const [html, setHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generatePreview = async () => {
      setIsLoading(true)
      try {
        const mjml = convertToMjml(content)
        const response = await fetch('/api/email/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mjml }),
        })
        const { html } = await response.json()
        setHtml(html)
      } catch (error) {
        console.error('Preview generation failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generatePreview()
  }, [content])

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <PreviewFrame html={html} viewMode="desktop" className="h-[400px]" />
    </div>
  )
}