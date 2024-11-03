# Getting Started

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
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/modern_cms_dev"

# Auth
WORKOS_API_KEY=your-workos-api-key-here
JWT_SECRET=your-jwt-secret-key

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Storage
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads

# Redis
REDIS_URL=redis://localhost:6379
```

5. Initialize the database:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## Initial Setup

After starting the server for the first time, visit `/setup` to complete the onboarding process:

1. Create admin account
2. Configure database settings
3. Set up email provider
4. Configure basic site settings
5. Set up user roles and permissions

## Development

### Project Structure

```
.
├── docs/               # Documentation
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── scripts/           # Build and utility scripts
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Core functionality
│   ├── providers/    # React context providers
│   └── types/        # TypeScript type definitions
├── themes/           # Theme system
└── tests/            # Test files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run typecheck` - Run TypeScript checks