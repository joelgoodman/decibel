import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { UserActions } from './user-actions'
import { User } from '@prisma/client'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-gray-500">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'secondary'}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'subscription',
    header: 'Subscription',
    cell: ({ row }) => {
      const status = row.original.subscription?.status
      return (
        <Badge variant={status === 'active' ? 'success' : 'secondary'}>
          {status || 'Free'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'newsletter',
    header: 'Newsletter',
    cell: ({ row }) => (
      <Badge variant={row.original.newsletter?.active ? 'success' : 'secondary'}>
        {row.original.newsletter?.active ? 'Subscribed' : 'Not Subscribed'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'PP'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
]