import { cn } from "@/lib/utils"

interface ListProps {
  items: {
    title: string
    description?: string
  }[]
  type?: "unordered" | "ordered" | "description"
  className?: string
}

export function List({ items, type = "unordered", className }: ListProps) {
  if (type === "description") {
    return (
      <dl className={cn("space-y-4", className)}>
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <dt className="font-medium">{item.title}</dt>
            {item.description && (
              <dd className="text-muted-foreground">{item.description}</dd>
            )}
          </div>
        ))}
      </dl>
    )
  }

  const ListComponent = type === "ordered" ? "ol" : "ul"
  const listStyles =
    type === "ordered"
      ? "list-decimal list-inside"
      : "list-disc list-inside"

  return (
    <ListComponent className={cn("space-y-2", listStyles, className)}>
      {items.map((item, index) => (
        <li key={index}>
          <span className="font-medium">{item.title}</span>
          {item.description && (
            <p className="mt-1 pl-5 text-muted-foreground">
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ListComponent>
  )
}