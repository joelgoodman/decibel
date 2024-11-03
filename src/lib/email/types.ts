export interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  templateId?: string
  variables?: Record<string, any>
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>
  sendBulkEmail(options: EmailOptions[]): Promise<void>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}