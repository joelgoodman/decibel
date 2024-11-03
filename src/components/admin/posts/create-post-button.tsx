import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreatePostButton() {
  return (
    <Button asChild>
      <Link href="/admin/posts/new">
        <Plus className="mr-2 h-4 w-4" />
        New Post
      </Link>
    </Button>
  )
}