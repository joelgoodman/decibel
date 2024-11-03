import { useState } from 'react'
import { Editor } from '@monaco-editor/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Send, Monitor, Smartphone } from 'lucide-react'
import { PreviewFrame } from './preview-frame'
import { useEmailPreview } from '@/hooks/use-email-preview'
import { type Post } from '@prisma/client'

interface EmailPreviewModalProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmailPreviewModal({
  post,
  open,
  onOpenChange,
}: EmailPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('preview')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const { toast } = useToast()
  
  const {
    mjmlContent,
    htmlContent,
    updateMjml,
    sendTestEmail,
    isSending,
    error,
  } = useEmailPreview(post)

  const handleSendTest = async () => {
    try {
      await sendTestEmail()
      toast({
        title: 'Test email sent',
        description: 'Check your inbox for the preview email',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <div className="flex items-center space-x-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">MJML Code</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSendTest}
              disabled={isSending}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Test
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <TabsContent value="preview" className="h-full">
            <PreviewFrame
              html={htmlContent}
              viewMode={viewMode}
              className="w-full h-full"
            />
          </TabsContent>

          <TabsContent value="code" className="h-full">
            <Editor
              height="100%"
              defaultLanguage="xml"
              value={mjmlContent}
              onChange={(value) => updateMjml(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
              }}
            />
          </TabsContent>
        </div>

        {error && (
          <div className="text-sm text-red-500 mt-2">
            Error: {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}