import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmailTemplates } from '@/hooks/queries/use-email-templates'
import { User } from '@prisma/client'
import { sendEmail } from '@/lib/email/send'
import { toast } from '@/components/ui/use-toast'

interface SendEmailDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendEmailDialog({ user, open, onOpenChange }: SendEmailDialogProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { data: templates } = useEmailTemplates()

  const handleTemplateChange = (id: string) => {
    const template = templates?.find((t) => t.id === id)
    if (template) {
      setTemplateId(id)
      setSubject(template.subject)
      setContent(template.content)
    }
  }

  const handleSend = async () => {
    try {
      setIsSending(true)
      await sendEmail({
        to: user.email,
        subject,
        content,
        templateId,
      })
      toast({
        title: 'Email sent',
        description: `Email successfully sent to ${user.email}`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Email to {user.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Email content"
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}