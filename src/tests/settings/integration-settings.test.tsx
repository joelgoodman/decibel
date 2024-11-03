import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntegrationSettings } from '@/components/admin/settings/integration-settings'
import { useSettings } from '@/hooks/queries/use-settings'
import { useIntegrationSettings } from '@/hooks/settings/use-integration-settings'
import { vi } from 'vitest'

// Mock the hooks
vi.mock('@/hooks/queries/use-settings')
vi.mock('@/hooks/settings/use-integration-settings')

describe('IntegrationSettings', () => {
  const mockSettings = {
    integrations: {
      email: {
        provider: 'smtp',
        from: 'test@example.com',
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          username: 'user',
          password: 'pass',
          secure: true,
        },
      },
      search: {
        provider: 'algolia',
        algolia: {
          appId: 'app123',
          apiKey: 'key123',
          searchKey: 'search123',
        },
      },
      monitoring: {
        sentry: {
          enabled: true,
          dsn: 'https://sentry.example.com',
        },
      },
    },
  }

  beforeEach(() => {
    vi.mocked(useSettings).mockReturnValue({
      data: mockSettings,
      isLoading: false,
    })

    vi.mocked(useIntegrationSettings).mockReturnValue({
      updateSettings: vi.fn(),
      isLoading: false,
    })
  })

  it('renders all sections', () => {
    render(<IntegrationSettings />)
    
    expect(screen.getByText('Email Provider')).toBeInTheDocument()
    expect(screen.getByText('Search Integration')).toBeInTheDocument()
    expect(screen.getByText('Error Monitoring')).toBeInTheDocument()
  })

  it('loads initial values correctly', () => {
    render(<IntegrationSettings />)
    
    expect(screen.getByDisplayValue('smtp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('smtp.example.com')).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const mockUpdateSettings = vi.fn()
    vi.mocked(useIntegrationSettings).mockReturnValue({
      updateSettings: mockUpdateSettings,
      isLoading: false,
    })

    render(<IntegrationSettings />)
    
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(mockSettings.integrations)
    })
  })

  it('validates required fields', async () => {
    render(<IntegrationSettings />)
    
    // Clear required field
    fireEvent.change(screen.getByLabelText('From Address'), {
      target: { value: '' },
    })
    
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('shows provider-specific fields', async () => {
    render(<IntegrationSettings />)
    
    // Change email provider to SendGrid
    fireEvent.change(screen.getByLabelText('Provider'), {
      target: { value: 'sendgrid' },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('SendGrid API Key')).toBeInTheDocument()
      expect(screen.queryByLabelText('SMTP Host')).not.toBeInTheDocument()
    })
  })
})