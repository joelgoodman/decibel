import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { MjmlToolbar } from './mjml-toolbar'
import { MjmlPreview } from './mjml-preview'
import { convertToMjml } from '@/lib/email/mjml-converter'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MjmlBlockEditorProps {
  initialContent?: string
  onChange?: (mjml: string) => void
}

export function MjmlBlockEditor({
  initialContent = '',
  onChange,
}: MjmlBlockEditorProps) {
  const [activeTab, setActiveTab] = useState('editor')

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const mjml = convertToMjml(content)
      onChange?.(mjml)
    },
  })

  const addBlock = useCallback((blockType: string) => {
    if (!editor) return

    switch (blockType) {
      case 'section':
        editor.chain().focus().setNode('section').run()
        break
      case 'column':
        editor.chain().focus().setNode('column').run()
        break
      case 'button':
        editor.chain().focus().setNode('button').run()
        break
      case 'image':
        editor.chain().focus().setNode('image').run()
        break
      case 'divider':
        editor.chain().focus().setNode('divider').run()
        break
    }
  }, [editor])

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor">Visual Editor</TabsTrigger>
          <TabsTrigger value="preview">MJML Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <MjmlToolbar editor={editor} onAddBlock={addBlock} />
          <div className="min-h-[400px] border rounded-lg p-4">
            <EditorContent editor={editor} />
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <MjmlPreview content={editor?.getHTML() || ''} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}