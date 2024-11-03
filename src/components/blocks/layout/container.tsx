import { cn } from "@/lib/utils"

type ContainerWidth = "sm" | "md" | "lg" | "xl" | "full"

interface ContainerProps {
  children: React.ReactNode
  width?: ContainerWidth
  className?: string
}

const containerStyles: Record<ContainerWidth, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
}

export function Container({
  children,
  width = "lg",
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        containerStyles[width],
        className
      )}
    >
      {children}
    </div>
  )
}