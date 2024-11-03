import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { PreviewFrame } from './preview-frame'

interface TemplatePreviewProps {
  templateId: string
  variables: string[]
}

export function TemplatePreview({
  templateId,
  variables,
}: TemplatePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handlePreview = async () => {
    try {
      const response = await fetch(`/api/admin/email/templates/${templateId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: variableValues }),
      })

      if (!response.ok) throw new Error('Failed to generate preview')

      const { html } = await response.json()
      setPreviewHtml(html)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate preview',
        variant: 'destructive',
      })
    }
  }

  const handleTestEmail = async () => {
    try {
      await fetch(`/api/admin/email/templates/${templateId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: variableValues }),
      })

      toast({
        title: 'Success',
        description: 'Test email sent successfully',
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
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Template Variables</h3>
          {variables.map((variable) => (
            <div key={variable} className="grid gap-2">
              <Label htmlFor={variable}>{variable}</Label>
              <Input
                id={variable}
                value={variableValues[variable] || ''}
                onChange={(e) =>
                  setVariableValues((prev) => ({
                    ...prev,
                    [variable]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleTestEmail}>
          Send Test Email
        </Button>
        <Button onClick={handlePreview}>
          Generate Preview
        </Button>
      </div>

      {previewHtml && (
        <PreviewFrame html={previewHtml} className="h-[500px]" />
      )}
    </div>
  )
}