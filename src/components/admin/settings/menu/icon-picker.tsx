import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import * as Icons from 'lucide-react'

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const icons = Object.entries(Icons).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedIcon = value ? Icons[value as keyof typeof Icons] : null
  const IconComponent = selectedIcon || Icons.Image

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select icon"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span>{value || 'Select icon...'}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search icons..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No icons found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {icons.map(([name, Icon]) => (
              <CommandItem
                key={name}
                value={name}
                onSelect={() => {
                  onChange(name)
                  setOpen(false)
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}