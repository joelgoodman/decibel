import { getAudioMetadata } from '@/lib/audio/metadata'
import { vi } from 'vitest'

describe('getAudioMetadata', () => {
  it('should extract metadata from audio file', async () => {
    const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const metadata = await getAudioMetadata(mockFile)
    
    expect(metadata).toHaveProperty('duration')
    expect(metadata).toHaveProperty('format')
    expect(metadata).toHaveProperty('bitrate')
  })
})