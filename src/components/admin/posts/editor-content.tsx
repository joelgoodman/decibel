import { type Editor, EditorContent as TiptapContent } from "@tiptap/react"
import { cn } from "@/lib/utils"

interface EditorContentProps {
  editor: Editor | null
}

export function EditorContent({ editor }: EditorContentProps) {
  return (
    <div className="relative min-h-[500px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
      <TiptapContent
        editor={editor}
        className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "focus:outline-none",
          "[&_p]:my-0",
          "[&_pre]:my-0 [&_pre]:bg-muted [&_pre]:p-2",
          "[&_ul]:my-0 [&_li]:my-0",
          "[&_ol]:my-0",
          "[&_blockquote]:my-0 [&_blockquote]:border-l-2 [&_blockquote]:pl-4"
        )}
      />
    </div>
  )
}