# Production Deployment Guide

## Overview

This guide covers deploying the AI Engineer Roadmap platform to production using Vercel (recommended) or Docker.

## Prerequisites

- GitHub repository connected to Vercel
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Redis instance (Upstash recommended)
- Domain name (optional, Vercel provides `.vercel.app`)

## Environment Variables

### Required for All Environments

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="32-byte-base64-secret"

# Encryption (for BYOK API keys)
ENCRYPTION_KEY="32-byte-base64-secret"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### Recommended for Production

```env
# OAuth Providers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Managed AI (optional, for users without BYOK)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# Monitoring
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_KEY=""
POSTHOG_HOST="https://app.posthog.com"

# Payments (optional)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

## Vercel Deployment (Recommended)

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure build settings (auto-detected)

### 2. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add all required variables for:
- **Production** (main branch)
- **Preview** (pull requests)
- **Development** (develop branch)

### 3. Database Setup

#### Neon (Recommended)
1. Create Neon project
2. Enable pgvector extension: `CREATE EXTENSION vector;`
3. Run migrations: `pnpm db:migrate deploy`
4. Add connection string to `DATABASE_URL`

#### Supabase
1. Create Supabase project
2. Enable pgvector in Database → Extensions
3. Run migrations
4. Use connection pooler URL for `DATABASE_URL`

#### Self-hosted PostgreSQL
```bash
# Ensure pgvector is installed
CREATE EXTENSION vector;

# Run migrations
pnpm db:migrate deploy
```

### 4. Redis Setup (Upstash)

1. Create Upstash Redis database
2. Enable REST API
3. Copy REST URL and token to environment variables

### 5. Deploy

```bash
# Automatic on push to main
git push origin main

# Or manual deploy
vercel --prod
```

### 6. Post-Deployment

1. Run database seed: `vercel env pull && pnpm db:seed`
2. Verify health endpoint: `https://your-domain.com/api/health`
3. Test authentication flow
4. Configure custom domain (optional)

## Docker Deployment

### Build Image

```bash
docker build -t ai-roadmap:latest .
```

### Run Container

```bash
docker run -d \
  --name ai-roadmap \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ai-roadmap:latest
```

### Docker Compose (Production)

```yaml
version: '3.8'
services:
  app:
    image: ai-roadmap:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ai_roadmap
      - UPSTASH_REDIS_REST_URL=http://redis:6379
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ai_roadmap
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migrations

### Development

```bash
# Create migration
pnpm db:migrate

# Apply pending migrations
pnpm db:migrate deploy
```

### Production (CI/CD)

```yaml
# .github/workflows/deploy.yml
- name: Run migrations
  run: |
    pnpm db:generate
    pnpm db:migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Rollback

```bash
# List migrations
pnpm db:migrate status

# Rollback last migration
pnpm db:migrate resolve --rolled-back "migration_name"
```

## Monitoring Setup

### Sentry

1. Create Sentry project
2. Add DSN to environment variables
3. Configure source maps upload in `vercel.json`:

```json
{
  "sentry": {
    "project": "your-project",
    "org": "your-org",
    "authToken": "${SENTRY_AUTH_TOKEN}"
  }
}
```

### PostHog

1. Create PostHog project
2. Add API key to environment variables
3. Events automatically tracked via `posthog-js`

### Vercel Analytics

Enabled automatically on Vercel. View in Vercel Dashboard → Analytics.

## Health Checks

### Application Health

```bash
curl https://your-domain.com/api/health
# Returns: {"status":"ok","timestamp":"..."}
```

### Database Health

```bash
# Via Prisma
pnpm db:studio
```

## Backup Strategy

### Database (Neon/Supabase)

- Automatic daily backups (7-day retention)
- Point-in-time recovery (PITR)
- Manual backup before major migrations

### Redis (Upstash)

- Automatic snapshots
- Configure backup schedule in Upstash dashboard

### Application Code

- GitHub repository (source of truth)
- Vercel deployment history
- Docker images in registry

## Scaling Considerations

### Vercel (Automatic)

- Edge Functions: Automatic scaling
- Serverless Functions: Configurable concurrency
- Bandwidth: Included in plan

### Database

- Neon: Auto-scaling compute
- Supabase: Read replicas, connection pooling
- Self-hosted: PgBouncer, read replicas

### Redis

- Upstash: Automatic scaling
- Self-hosted: Redis Cluster

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version (20+), clear cache |
| DB connection fails | Verify DATABASE_URL, SSL mode, pgvector |
| Auth redirects loop | Check NEXTAUTH_URL matches domain |
| AI streaming fails | Verify API keys, check edge function limits |
| Rate limited | Adjust Upstash rate limits |

### Logs

```bash
# Vercel logs
vercel logs

# Docker logs
docker logs -f ai-roadmap

# Database logs
# Check provider dashboard
```

## Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] NEXTAUTH_SECRET is 32+ bytes random
- [ ] ENCRYPTION_KEY is 32 bytes base64
- [ ] Database SSL enabled
- [ ] Redis TLS enabled
- [ ] CSP headers configured
- [ ] Rate limiting active
- [ ] Sentry error tracking enabled
- [ ] Dependabot alerts monitored
- [ ] Regular security updates

## Rollback Procedure

1. **Vercel**: Click "Rollback" on previous deployment
2. **Database**: Use migration rollback or PITR
3. **Docker**: Deploy previous image tag
4. **DNS**: Switch to previous deployment URL

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Security: security@your-domain.com