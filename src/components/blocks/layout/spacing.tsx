import { cn } from "@/lib/utils"

type SpacingSize = "none" | "sm" | "md" | "lg" | "xl"

interface SpacingProps {
  children: React.ReactNode
  margin?: SpacingSize
  padding?: SpacingSize
  className?: string
}

const spacingStyles: Record<SpacingSize, string> = {
  none: "",
  sm: "p-2 m-2",
  md: "p-4 m-4",
  lg: "p-6 m-6",
  xl: "p-8 m-8",
}

export function Spacing({
  children,
  margin = "none",
  padding = "none",
  className,
}: SpacingProps) {
  return (
    <div
      className={cn(
        margin !== "none" && `m-${spacingStyles[margin]}`,
        padding !== "none" && `p-${spacingStyles[padding]}`,
        className
      )}
    >
      {children}
    </div>
  )
}