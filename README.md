# Modern CMS with Podcast Management

A full-featured, modern CMS built with Next.js, featuring advanced podcast management, content publishing, and user management capabilities.

## Features

- 📝 Content Management
  - Posts, Pages, and Media management
  - Rich text editor with real-time preview
  - SEO optimization tools
  - Version history and drafts

- 🎙️ Podcast Management
  - Multi-series support
  - Audio file handling
  - RSS feed generation
  - Analytics and metrics
  - Batch operations

- 👥 User Management
  - Role-based access control
  - User profiles
  - Subscription management
  - Activity tracking

- 📧 Email System
  - Newsletter management
  - MJML email templates
  - Multiple provider support
  - Batch sending

- 🔒 Security Features
  - Rate limiting
  - File validation
  - Input sanitization
  - CORS configuration

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for rate limiting)
- AWS S3 or compatible storage (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/modern-cms.git
cd modern-cms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cms"

# Authentication
JWT_SECRET="your-jwt-secret"
WORKOS_CLIENT_ID="your-workos-client-id"

# Storage
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-bucket-name"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# Redis
UPSTASH_REDIS_URL="your-redis-url"
UPSTASH_REDIS_TOKEN="your-redis-token"
```

5. Initialize the database:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## Configuration Options

### Storage Providers

The system supports multiple storage providers for media files:

- Local filesystem (development only)
- Amazon S3
- Cloudinary

Configure your preferred provider in `src/lib/storage/config.ts`.

### Email Providers

Supported email providers:

- SMTP
- SendGrid
- Amazon SES

Configure email settings in the admin interface or `src/lib/email/config.ts`.

### Search Integration

Available search providers:

- Algolia
- Meilisearch

Configure search settings in the admin interface.

## API Documentation

### Authentication

All API routes under `/api/*` require authentication unless specified otherwise.

Authentication headers:
```http
Authorization: Bearer <jwt-token>
```

### Rate Limiting

Default limits:
- API: 100 requests per 15 minutes
- Auth: 5 attempts per hour
- Upload: 10 uploads per hour

### Endpoints

#### Podcasts

```typescript
// Create podcast series
POST /api/podcasts/series
Content-Type: application/json

{
  "title": string
  "description": string
  "slug": string
  "artwork"?: string
  "author": string
  "language": string
  "explicit": boolean
}

// Create episode
POST /api/podcasts/episodes
Content-Type: application/json

{
  "title": string
  "description": string
  "audioUrl": string
  "seriesId": string
  "explicit": boolean
}
```

See `src/app/api/` for complete API documentation.

## Testing

### Setup

1. Create a test database:
```bash
createdb cms_test
```

2. Configure test environment:
```bash
cp .env.test.example .env.test
```

3. Install test dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/tests/podcasts/podcast-editor.test.tsx

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Follow these patterns for different test types:

```typescript
// Component tests
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Example')).toBeInTheDocument()
  })
})

// API tests
describe('API: /api/endpoint', () => {
  it('should handle requests correctly', async () => {
    const response = await fetch('/api/endpoint')
    expect(response.status).toBe(200)
  })
})

// Integration tests
describe('Feature: Example', () => {
  it('should work end-to-end', async () => {
    // Test complete feature flow
  })
})
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Follow component structure guidelines

### Pull Request Process

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git commit -m "feat: add new feature"
```

3. Push to your fork:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request with:
   - Clear description
   - Screenshots (if UI changes)
   - Test coverage
   - Documentation updates

### Issue Reporting

When reporting issues, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details
5. Screenshots/logs if applicable

## License

MIT License - see LICENSE file for details