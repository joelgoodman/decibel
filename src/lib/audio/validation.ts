import { z } from 'zod'

export const audioMetadataSchema = z.object({
  duration: z.number().min(1, 'Audio duration must be greater than 0'),
  format: z.string(),
  bitrate: z.number().min(64000, 'Bitrate must be at least 64kbps'),
  sampleRate: z.number().min(44100, 'Sample rate must be at least 44.1kHz'),
  channels: z.number().min(1).max(2, 'Only mono or stereo audio supported'),
  fileSize: z.number().max(524288000, 'File size must not exceed 500MB'),
})

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',  // MP3
  'audio/wav',   // WAV
  'audio/aac',   // AAC
  'audio/mp4',   // M4A
]

export const MAX_FILE_SIZE = 524288000 // 500MB

export async function validateAudioFile(file: File): Promise<void> {
  if (!file.type.startsWith('audio/')) {
    throw new Error('Invalid file type. Only audio files are allowed.')
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    throw new Error('Unsupported audio format. Please use MP3, WAV, AAC, or M4A.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 500MB limit.')
  }

  // Validate file signature
  const buffer = await file.slice(0, 4).arrayBuffer()
  const header = new Uint8Array(buffer)
  
  if (!isValidAudioSignature(header, file.type)) {
    throw new Error('Invalid audio file format.')
  }
}

function isValidAudioSignature(header: Uint8Array, mimeType: string): boolean {
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