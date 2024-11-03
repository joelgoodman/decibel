import Plyr from "plyr-react"
import { cn } from "@/lib/utils"
import "plyr/dist/plyr.css"

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  className?: string
}

export function AudioPlayer({
  src,
  title,
  artist,
  className,
}: AudioPlayerProps) {
  const options = {
    controls: [
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      "volume",
    ],
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {(title || artist) && (
        <div className="mb-2">
          {title && <h3 className="font-medium">{title}</h3>}
          {artist && <p className="text-sm text-muted-foreground">{artist}</p>}
        </div>
      )}
      <Plyr
        source={{
          type: "audio",
          sources: [{ src, type: "audio/mp3" }],
        }}
        options={options}
      />
    </div>
  )
}