# Deployment

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis
- AWS S3 or compatible storage (optional)

## Environment Variables

Required environment variables for production:

```env
# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth
WORKOS_API_KEY=your-workos-api-key
JWT_SECRET=your-secure-jwt-secret

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-bucket-name

# Redis
REDIS_URL=redis://username:password@host:port
```

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Deployment Options

### Netlify

1. Connect your repository
2. Set environment variables
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

### Docker

1. Build the image:
```bash
docker build -t modern-cms .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  modern-cms
```

## Post-Deployment

1. Run database migrations:
```bash
npx prisma migrate deploy
```

2. Verify environment variables:
```bash
npm run verify-env
```

3. Test the deployment:
```bash
npm run test:e2e
```

## Monitoring

1. Set up application monitoring
2. Configure error tracking
3. Enable performance monitoring
4. Set up uptime monitoring

## Backup Strategy

1. Database backups
2. File storage backups
3. Configuration backups
4. Automated backup verification