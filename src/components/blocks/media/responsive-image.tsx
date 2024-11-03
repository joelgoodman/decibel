import Image from "next/image"
import { cn } from "@/lib/utils"

type ImageLayout = "contained" | "wide" | "full"

interface ResponsiveImageProps {
  src: string
  alt: string
  layout?: ImageLayout
  className?: string
  priority?: boolean
}

const layoutStyles: Record<ImageLayout, string> = {
  contained: "max-w-2xl mx-auto",
  wide: "max-w-4xl mx-auto",
  full: "w-full",
}

export function ResponsiveImage({
  src,
  alt,
  layout = "contained",
  className,
  priority = false,
}: ResponsiveImageProps) {
  return (
    <div className={cn("relative", layoutStyles[layout], className)}>
      <div className="relative aspect-w-16 aspect-h-9">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority={priority}
        />
      </div>
    </div>
  )
}