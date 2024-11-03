import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { Grid } from '@/components/blocks/layout/grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MediaCard } from './media-card'
import { MediaUploader } from './media-uploader'
import { useMediaLibrary } from '@/hooks/queries/use-media'
import { Search, FolderPlus } from 'lucide-react'

export function MediaLibrary() {
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  const { data, isLoading } = useMediaLibrary({
    search,
    folder: selectedFolder,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setSelectedFolder(null)}>
            All Files
          </Button>
          <Button variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
        <MediaUploader />
      </div>

      <Grid
        columns={{ default: 2, sm: 3, md: 4, lg: 5 }}
        gap="md"
        className="min-h-[400px]"
      >
        {data?.items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </Grid>
    </div>
  )
}