import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Eye, Trash } from "lucide-react"
import { Post } from "@prisma/client"

interface PostActionsProps {
  post: Post
}

export function PostActions({ post }: PostActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/admin/posts/${post.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/posts/${post.slug}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}