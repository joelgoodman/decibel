import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { usePodcastSeries } from '@/hooks/queries/use-podcast-series'
import { cn } from '@/lib/utils'

interface SeriesSwitcherProps {
  currentSeriesId?: string
  onSeriesChange: (seriesId: string) => void
}

export function SeriesSwitcher({ currentSeriesId, onSeriesChange }: SeriesSwitcherProps) {
  const [open, setOpen] = useState(false)
  const { data } = usePodcastSeries({ status: 'active' })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentSeries = data?.series.find(s => s.id === currentSeriesId)

  // Focus management
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select podcast series"
          aria-controls="series-selector"
          className="w-[250px] justify-between"
        >
          <span className="truncate">
            {currentSeries?.title || "Select series..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[250px] p-0" 
        id="series-selector"
        onKeyDown={handleKeyDown}
      >
        <Command>
          <CommandInput 
            ref={inputRef}
            placeholder="Search series..." 
            aria-label="Search podcast series"
          />
          <CommandEmpty>No series found.</CommandEmpty>
          <CommandGroup aria-label="Available series">
            {data?.series.map((series) => (
              <CommandItem
                key={series.id}
                onSelect={() => {
                  onSeriesChange(series.id)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className="cursor-pointer"
                role="option"
                aria-selected={currentSeriesId === series.id}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentSeriesId === series.id ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
                <span>{series.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}