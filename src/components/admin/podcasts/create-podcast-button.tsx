import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreatePodcastButton() {
  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href="/admin/podcasts/series/new">
          <Plus className="mr-2 h-4 w-4" />
          New Series
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/admin/podcasts/new">
          <Plus className="mr-2 h-4 w-4" />
          New Episode
        </Link>
      </Button>
    </div>
  )
}