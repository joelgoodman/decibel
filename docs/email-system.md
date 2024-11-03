# Email System

## Overview

The email system provides a flexible, template-based approach to sending emails with support for multiple providers.

## Templates

Templates use a combination of Handlebars for variables and MJML for responsive email layouts:

```handlebars
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          Hello {{name}},
          
          {{content}}
          
          Best regards,
          {{signature}}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

## Providers

### SMTP

```typescript
{
  provider: 'smtp',
  host: 'smtp.example.com',
  port: 587,
  username: 'user',
  password: 'pass',
  secure: true
}
```

### SendGrid

```typescript
{
  provider: 'sendgrid',
  apiKey: 'your-api-key'
}
```

### Amazon SES

```typescript
{
  provider: 'ses',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  region: 'us-east-1'
}
```

## Usage

```typescript
import { sendEmail } from '@/lib/email/send'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  templateId: 'welcome-email',
  variables: {
    name: 'John',
    content: 'Welcome to our platform!'
  }
})
```