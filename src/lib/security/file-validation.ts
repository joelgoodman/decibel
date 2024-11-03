import { z } from 'zod'

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',  // MP3
  'audio/wav',   // WAV
  'audio/aac',   // AAC
  'audio/mp4',   // M4A
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const audioFileSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size must not exceed 10MB'),
  type: z.enum(ALLOWED_AUDIO_TYPES as [string, ...string[]], {
    message: 'Invalid file type. Only MP3, WAV, and AAC files are allowed.',
  }),
})

export async function validateAudioFile(file: File): Promise<void> {
  // Validate file metadata
  audioFileSchema.parse({
    size: file.size,
    type: file.type,
  })

  // Additional validation for file content
  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer.slice(0, 4))

  // Validate file signatures
  const isValidSignature = validateFileSignature(header, file.type)
  if (!isValidSignature) {
    throw new Error('Invalid file content')
  }
}

function validateFileSignature(header: Uint8Array, mimeType: string): boolean {
  const signatures: Record<string, number[]> = {
    'audio/mpeg': [0x49, 0x44, 0x33], // ID3
    'audio/wav': [0x52, 0x49, 0x46, 0x46], // RIFF
    'audio/aac': [0xFF, 0xF1], // ADTS
    'audio/mp4': [0x66, 0x74, 0x79, 0x70], // ftyp
  }

  const signature = signatures[mimeType]
  if (!signature) return false

  return signature.every((byte, i) => header[i] === byte)
}