import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Play, Calendar, Trash } from 'lucide-react'
import { useState } from 'react'
import { SchedulingDialog } from '@/components/posts/scheduling-dialog'
import { useRouter } from 'next/navigation'
import { type PodcastEpisode } from '@/types/podcast'

interface EpisodeActionsProps {
  episode: PodcastEpisode
}

export function EpisodeActions({ episode }: EpisodeActionsProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const router = useRouter()

  const handleSchedule = async (date: Date) => {
    try {
      await fetch(`/api/podcasts/episodes/${episode.id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ publishAt: date.toISOString() }),
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to schedule episode:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            aria-label="Episode actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/podcasts/episodes/${episode.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href={`/podcasts/${episode.series.slug}/${episode.id}`} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play className="mr-2 h-4 w-4" />
              Preview
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setScheduleOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => {
              if (confirm('Are you sure you want to delete this episode?')) {
                // Handle delete
              }
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SchedulingDialog
        postId={episode.id}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSchedule={handleSchedule}
      />
    </>
  )
}