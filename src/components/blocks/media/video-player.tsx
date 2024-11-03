import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  url: string
  title?: string
  width?: string | number
  height?: string | number
  className?: string
}

export function VideoPlayer({
  url,
  title,
  width = "100%",
  height = "auto",
  className,
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("")

  useEffect(() => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URLSearchParams(new URL(url).search).get("v")
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}`)
    } else if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()
      setEmbedUrl(`https://player.vimeo.com/video/${videoId}`)
    } else if (url.includes("wistia.com")) {
      const videoId = url.split("/").pop()
      setEmbedUrl(`https://fast.wistia.net/embed/iframe/${videoId}`)
    }
  }, [url])

  if (!embedUrl) return null

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-black",
        "aspect-w-16 aspect-h-9",
        className
      )}
      style={{ width, height }}
    >
      <iframe
        src={embedUrl}
        title={title || "Video player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}