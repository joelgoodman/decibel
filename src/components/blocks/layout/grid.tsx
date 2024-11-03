import { cn } from "@/lib/utils"

type GridColumns = 1 | 2 | 3 | 4 | 6 | 12
type GridGap = "none" | "sm" | "md" | "lg"

interface GridProps {
  children: React.ReactNode
  columns?: {
    default?: GridColumns
    sm?: GridColumns
    md?: GridColumns
    lg?: GridColumns
  }
  gap?: GridGap
  className?: string
}

const gapStyles: Record<GridGap, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
}

export function Grid({
  children,
  columns = { default: 1 },
  gap = "md",
  className,
}: GridProps) {
  const gridCols = {
    default: `grid-cols-${columns.default}`,
    sm: columns.sm ? `sm:grid-cols-${columns.sm}` : "",
    md: columns.md ? `md:grid-cols-${columns.md}` : "",
    lg: columns.lg ? `lg:grid-cols-${columns.lg}` : "",
  }

  return (
    <div
      className={cn(
        "grid",
        gapStyles[gap],
        gridCols.default,
        gridCols.sm,
        gridCols.md,
        gridCols.lg,
        className
      )}
    >
      {children}
    </div>
  )
}