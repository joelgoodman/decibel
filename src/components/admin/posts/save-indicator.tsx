import { Loader2, Check } from 'lucide-react'
import { format } from 'date-fns'

interface SaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  isDirty: boolean
}

export function SaveIndicator({ 
  isSaving, 
  lastSaved, 
  isDirty 
}: SaveIndicatorProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Saving...
        </>
      ) : isDirty ? (
        'Unsaved changes'
      ) : lastSaved ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Saved {format(lastSaved, 'h:mm a')}
        </>
      ) : null}
    </div>
  )
}