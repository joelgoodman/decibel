import { useState } from 'react'
import Image from 'next/image'
import { formatBytes } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Download, Pencil, Trash } from 'lucide-react'
import { MediaEditDialog } from './media-edit-dialog'

interface MediaCardProps {
  item: {
    id: string
    filename: string
    url: string
    type: string
    size: number
    width?: number
    height?: number
    alt?: string
    title?: string
  }
}

export function MediaCard({ item }: MediaCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleDownload = () => {
    window.open(item.url, '_blank')
  }

  return (
    <>
      <Card className="group relative overflow-hidden">
        <div className="aspect-square relative">
          {item.type === 'image' ? (
            <Image
              src={item.url}
              alt={item.alt || item.filename}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              {/* Add icons for different file types */}
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm font-medium truncate" title={item.filename}>
            {item.filename}
          </p>
          <p className="text-xs text-gray-500">
            {formatBytes(item.size)}
            {item.width && item.height && ` · ${item.width}×${item.height}`}
          </p>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <MediaEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={item}
      />
    </>
  )
}