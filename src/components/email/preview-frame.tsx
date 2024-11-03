import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PreviewFrameProps {
  html: string
  viewMode: 'desktop' | 'mobile'
  className?: string
}

export function PreviewFrame({
  html,
  viewMode,
  className,
}: PreviewFrameProps) {
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
    <div className={cn('relative overflow-hidden rounded-md', className)}>
      <iframe
        ref={iframeRef}
        className={cn(
          'w-full h-full border-0',
          viewMode === 'mobile' && 'max-w-[375px] mx-auto'
        )}
        title="Email Preview"
      />
    </div>
  )
}