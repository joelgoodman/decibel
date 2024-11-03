import { Check } from "lucide-react"
import { Category } from "@prisma/client"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategorySelectProps {
  categories: Category[]
  selected: string[]
  onSelect: (value: string[]) => void
}

export function CategorySelect({
  categories,
  selected,
  onSelect,
}: CategorySelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          {selected.length > 0
            ? `${selected.length} selected`
            : "Select categories"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No categories found.</CommandEmpty>
          <CommandGroup>
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => {
                  onSelect(
                    selected.includes(category.id)
                      ? selected.filter((id) => id !== category.id)
                      : [...selected, category.id]
                  )
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(category.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {category.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}