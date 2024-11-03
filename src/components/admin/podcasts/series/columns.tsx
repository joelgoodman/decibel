import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { SeriesActions } from './series-actions'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface Series {
  id: string
  title: string
  description: string
  artwork?: string
  status: string
  episodeCount: number
  author: string
  createdAt: string
}

export const columns: ColumnDef<Series>[] = [
  {
    accessorKey: 'artwork',
    header: '',
    cell: ({ row }) => row.original.artwork && (
      <OptimizedImage
        src={row.original.artwork}
        alt={row.original.title}
        width={40}
        height={40}
        className="rounded-md"
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'episodeCount',
    header: 'Episodes',
    cell: ({ row }) => row.original.episodeCount,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'active' ? 'success' : 'secondary'}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => row.original.author,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'PP'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <SeriesActions series={row.original} />,
  },
]