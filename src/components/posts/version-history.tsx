import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVersionHistory } from '@/hooks/queries/use-version-history'
import { Clock, RotateCcw } from 'lucide-react'

interface VersionHistoryProps {
  postId: string
  currentVersion: number
  onRestore: (versionId: string) => void
}

export function VersionHistory({
  postId,
  currentVersion,
  onRestore,
}: VersionHistoryProps) {
  const { data: versions, isLoading } = useVersionHistory(postId)

  if (isLoading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Version History</h3>
        <Badge variant="secondary">Current: v{currentVersion}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions?.map((version) => (
            <TableRow key={version.id}>
              <TableCell>v{version.version}</TableCell>
              <TableCell>
                {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
              </TableCell>
              <TableCell>{version.user.name}</TableCell>
              <TableCell>
                <Badge
                  variant={version.isPublished ? 'success' : 'secondary'}
                >
                  {version.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(version.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}