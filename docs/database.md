# Database

## Schema

The database schema is managed using Prisma and includes the following core models:

```prisma
// Core models
model User
model Settings
model AuditLog
model EmailTemplate
model PerformanceMetric
model Menu
model SecureCredential
model AnalyticsEvent
```

## Migrations

Migrations are handled through Prisma:

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma reset
```

## Database Providers

### Local Development

```env
DATABASE_URL="postgresql://user:password@localhost:5432/modern_cms_dev"
```

### Neon

```env
DATABASE_URL="postgres://user:pass@ep-example-123.us-east-2.aws.neon.tech/neondb"
```

### Supabase

```env
DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

## Connection Management

- Connection pooling enabled by default
- Automatic retries for failed queries
- Graceful connection handling

## Backup and Restore

```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore ./backup.sql
```