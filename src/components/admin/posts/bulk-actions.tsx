import { useState } from 'react'
import { Check, Loader2, Trash, Globe, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { useAsync } from '@/hooks/use-async'

interface BulkActionsProps {
  selectedIds: string[]
  onSuccess: () => void
  onClearSelection: () => void
}

export function BulkActions({ 
  selectedIds, 
  onSuccess, 
  onClearSelection 
}: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoading, run } = useAsync()

  const handleAction = async (action: string) => {
    try {
      await run(
        fetch('/api/posts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds, action }),
        })
      )

      toast({
        title: 'Success',
        description: `Successfully ${action}ed ${selectedIds.length} posts`,
      })
      
      onSuccess()
      onClearSelection()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      })
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </span>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Bulk Actions'
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction('publish')}>
            <Globe className="mr-2 h-4 w-4" />
            Publish Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('unpublish')}>
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish Selected
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAction('delete')}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
    </div>
  )
}