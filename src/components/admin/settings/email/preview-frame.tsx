import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PreviewFrameProps {
  html: string
  className?: string
}

export function PreviewFrame({ html, className }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      title="Email Preview"
      className={cn('w-full border rounded-md', className)}
      sandbox="allow-same-origin"
    />
  )
}