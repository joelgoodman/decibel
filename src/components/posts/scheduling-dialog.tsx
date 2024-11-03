import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface SchedulingDialogProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (date: Date) => void
}

export function SchedulingDialog({
  postId,
  open,
  onOpenChange,
  onSchedule,
}: SchedulingDialogProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('12:00')
  const { toast } = useToast()

  const handleSchedule = () => {
    if (!date) {
      toast({
        title: 'Select date',
        description: 'Please select a publication date',
        variant: 'destructive',
      })
      return
    }

    const [hours, minutes] = time.split(':').map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes)

    if (scheduledDate <= new Date()) {
      toast({
        title: 'Invalid date',
        description: 'Please select a future date and time',
        variant: 'destructive',
      })
      return
    }

    onSchedule(scheduledDate)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Publication</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Publication Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label>Publication Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}