import { parseFile, parseStream } from 'music-metadata'
import { fetchWithErrorHandling } from '../errors/api-client'

export interface AudioMetadata {
  duration: number
  format: string
  bitrate: number
  sampleRate: number
  channels: number
  fileSize: number
}

export async function getAudioMetadata(input: string | File): Promise<AudioMetadata> {
  try {
    let metadata

    if (typeof input === 'string') {
      // For URLs
      const response = await fetchWithErrorHandling(input)
      metadata = await parseStream(response.body)
    } else {
      // For local files
      metadata = await parseFile(input)
    }

    return {
      duration: metadata.format.duration || 0,
      format: metadata.format.container,
      bitrate: metadata.format.bitrate || 0,
      sampleRate: metadata.format.sampleRate || 0,
      channels: metadata.format.numberOfChannels || 0,
      fileSize: metadata.format.size || 0,
    }
  } catch (error) {
    console.error('Failed to extract audio metadata:', error)
    throw new Error('Failed to extract audio metadata')
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}