import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { EpisodeActions } from './episode-actions'
import { AudioPlayer } from '@/components/blocks/media/audio-player'
import { formatDuration } from '@/lib/audio/metadata'
import { type PodcastEpisode } from '@/types/podcast'

export const columns: ColumnDef<PodcastEpisode>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-2">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'audio',
    header: 'Audio',
    cell: ({ row }) => (
      <AudioPlayer
        src={row.original.audioUrl}
        title={row.original.title}
        className="w-48"
        aria-label={`Play ${row.original.title}`}
      />
    ),
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => formatDuration(row.original.duration),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'published' ? 'success' :
          row.original.status === 'scheduled' ? 'warning' :
          'secondary'
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published',
    cell: ({ row }) =>
      row.original.publishedAt
        ? format(new Date(row.original.publishedAt), 'PP')
        : '-',
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => row.original.author.name,
  },
  {
    id: 'actions',
    cell: ({ row }) => <EpisodeActions episode={row.original} />,
  },
]