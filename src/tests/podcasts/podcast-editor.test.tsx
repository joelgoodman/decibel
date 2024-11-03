import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PodcastEditor } from '@/components/admin/podcasts/podcast-editor'
import { vi } from 'vitest'

describe('PodcastEditor', () => {
  it('should validate required fields', async () => {
    render(<PodcastEditor />)
    
    const submitButton = screen.getByText('Save Draft')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })

  it('should handle audio upload', async () => {
    const onUploadComplete = vi.fn()
    render(<PodcastEditor />)
    
    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const input = screen.getByLabelText(/drop.*audio file/i)
    
    fireEvent.drop(input, { dataTransfer: { files: [file] } })

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled()
    })
  })
})