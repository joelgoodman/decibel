import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { AudioPlayer } from '@/components/blocks/media/audio-player'
import { Upload, X, Link as LinkIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AudioUploaderProps {
  onUploadComplete: (url: string, metadata?: AudioMetadata) => void
  onUploadStart: () => void
  onUploadEnd: () => void
  currentUrl?: string
}

export interface AudioMetadata {
  duration: number
  format: string
  bitrate: number
  sampleRate: number
  channels: number
  fileSize: number
}

export function AudioUploader({
  onUploadComplete,
  onUploadStart,
  onUploadEnd,
  currentUrl,
}: AudioUploaderProps) {
  const [progress, setProgress] = useState(0)
  const [externalUrl, setExternalUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setError(null)
      onUploadStart()
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const { url, metadata } = await response.json()
      onUploadComplete(url, metadata)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
      console.error('Upload error:', error)
    } finally {
      onUploadEnd()
    }
  }, [onUploadComplete, onUploadStart, onUploadEnd])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.m4a', '.wav'],
    },
    maxFiles: 1,
    noKeyboard: false, // Enable keyboard interaction
  })

  // Focus management for URL input
  useEffect(() => {
    if (showUrlInput && urlInputRef.current) {
      urlInputRef.current.focus()
    }
  }, [showUrlInput])

  const handleExternalUrl = async () => {
    if (!externalUrl) return

    try {
      setError(null)
      onUploadStart()
      const response = await fetch('/api/podcasts/validate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: externalUrl }),
      })

      if (!response.ok) throw new Error('Invalid audio URL')

      const { metadata } = await response.json()
      onUploadComplete(externalUrl, metadata)
      setShowUrlInput(false)
      setExternalUrl('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid audio URL')
    } finally {
      onUploadEnd()
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div 
          role="alert" 
          className="text-red-600 text-sm"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {currentUrl ? (
        <div className="space-y-2">
          <AudioPlayer 
            src={currentUrl} 
            aria-label="Current audio file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onUploadComplete('')
              setError(null)
            }}
            aria-label="Remove audio file"
          >
            <X className="h-4 w-4 mr-2" aria-hidden="true" />
            Remove Audio
          </Button>
        </div>
      ) : showUrlInput ? (
        <div className="space-y-2">
          <Label htmlFor="external-url">External Audio URL</Label>
          <div className="flex gap-2">
            <Input
              id="external-url"
              ref={urlInputRef}
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              className="flex-1"
              aria-invalid={!!error}
              aria-describedby={error ? "url-error" : undefined}
            />
            <Button 
              onClick={handleExternalUrl}
              aria-label="Add external audio URL"
            >
              Add
            </Button>
          </div>
          {error && (
            <span id="url-error" className="text-red-600 text-sm">
              {error}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput(false)}
            aria-label="Cancel adding external URL"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center",
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
              "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            )}
            role="button"
            tabIndex={0}
            aria-label="Upload audio file"
          >
            <input {...getInputProps()} aria-label="File input" />
            <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the audio file here...'
                : 'Drag & drop an audio file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports MP3, M4A, WAV (max 500MB)
            </p>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(true)}
              aria-label="Use external URL instead"
            >
              <LinkIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Use External URL
            </Button>
          </div>
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="space-y-2">
          <Progress 
            value={progress} 
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
          <p className="text-sm text-gray-500" aria-live="polite">
            Uploading... {progress}%
          </p>
        </div>
      )}
    </div>
  )
}