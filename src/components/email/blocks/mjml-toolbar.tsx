import { type Editor } from '@tiptap/react'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Columns,
  SplitSquareVertical,
  Button as ButtonIcon,
  Minus,
} from 'lucide-react'

interface MjmlToolbarProps {
  editor: Editor | null
  onAddBlock: (blockType: string) => void
}

export function MjmlToolbar({ editor, onAddBlock }: MjmlToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-1 border rounded-lg">
      <div className="flex gap-1 border-r pr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex gap-1 border-r pr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex gap-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('section')}
          onPressedChange={() => onAddBlock('section')}
        >
          <SplitSquareVertical className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('column')}
          onPressedChange={() => onAddBlock('column')}
        >
          <Columns className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('button')}
          onPressedChange={() => onAddBlock('button')}
        >
          <ButtonIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('image')}
          onPressedChange={() => onAddBlock('image')}
        >
          <Image className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('divider')}
          onPressedChange={() => onAddBlock('divider')}
        >
          <Minus className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  )
}