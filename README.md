# AI Engineer Roadmap

A production-ready, full-stack learning platform for AI Engineering. Built with Next.js 14, TypeScript, tRPC, Prisma, and Vercel AI SDK.

## 🚀 Features

- **Interactive Roadmaps** - Visual learning paths with progress tracking
- **AI Tutoring** - Personalized AI tutor with BYOK (Bring Your Own Key) support
- **Knowledge Graphs** - Interactive concept visualization with React Flow
- **Adaptive Quizzes** - AI-generated assessments with spaced repetition
- **RAG-Enhanced Learning** - Context-aware answers from curated knowledge base
- **Study Planner** - Personalized learning schedules with analytics
- **Dark/Light Mode** - Full theme support with persistence
- **Enterprise Security** - RBAC, encryption, rate limiting, audit logging

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router, Server Components, Streaming)
- **TypeScript 5** (Strict mode, full type safety)
- **Tailwind CSS** + **Radix UI** (Accessible components)
- **TanStack Query** (Server state management)
- **Zustand** (Client state)
- **React Flow** (Knowledge graphs)
- **Framer Motion** (Animations)

### Backend
- **tRPC** (End-to-end type-safe APIs)
- **NextAuth.js v5** (Authentication with RBAC)
- **Prisma ORM** (Type-safe database access)
- **Zod** (Runtime validation)

### AI/ML
- **Vercel AI SDK** (Streaming, tool calling)
- **LangChain.js** (RAG pipelines)
- **OpenAI/Anthropic/Google** (Multi-provider support)
- **pgvector** (Vector embeddings in PostgreSQL)

### Database
- **PostgreSQL** (Neon/Supabase) with pgvector
- **Redis** (Upstash) for caching & rate limiting

### DevOps
- **Vercel** (Edge deployment, preview URLs)
- **Docker** (Local development parity)
- **GitHub Actions** (CI/CD)
- **Sentry** (Error tracking)
- **PostHog** (Analytics)

## 📋 Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ with pgvector
- Redis 7+

## 🏁 Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd ai-engineer-roadmap
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_roadmap"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="32-byte-base64-encoded-key"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

### 4. Start Development

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 🐳 Docker Development

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app pnpm db:migrate

# Seed database
docker-compose exec app pnpm db:seed
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (tRPC, webhooks)
│   ├── auth/              # Auth pages (signin, signup)
│   └── roadmap/[slug]/    # Dynamic roadmap pages
├── components/
│   ├── ui/                # Base UI components (Radix + Tailwind)
│   ├── landing/           # Landing page sections
│   ├── layout/            # Header, footer, providers
│   ├── roadmap/           # Roadmap-specific components
│   ├── quiz/              # Quiz player components
│   └── chat/              # AI chat interface
├── db/                    # Prisma client
├── lib/                   # Utilities (encryption, logging, errors)
├── services/
│   └── ai/               # AI services (chat, quiz, RAG)
├── trpc/                  # tRPC routers and procedures
│   ├── init.ts           # Context, middleware, procedures
│   ├── routers/          # Feature routers
│   └── client.tsx        # tRPC React client
└── middleware.ts         # Next.js middleware (auth)
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui
```

## 🔧 Code Quality

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Format
pnpm format

# Check formatting
pnpm format:check
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables
3. Deploy

```bash
# Production deploy
vercel --prod
```

### Docker Production

```bash
# Build
docker build -t ai-roadmap .

# Run
docker run -p 3000:3000 --env-file .env.production ai-roadmap
```

### Environment-Specific Configs

| Environment | Database | Redis | Auth | AI |
|-------------|----------|-------|------|-----|
| Development | Local/Neon Dev | Local/Upstash Dev | Local | BYOK/Managed |
| Staging | Neon Staging | Upstash Staging | OAuth | Managed |
| Production | Neon Prod | Upstash Prod | OAuth + SSO | Managed |

## 🔐 Security Features

- **Authentication**: NextAuth.js v5 with credentials & OAuth
- **Authorization**: Role-based access control (Admin, Author, Premium, User, Guest)
- **API Security**: tRPC middleware, Zod validation, rate limiting
- **Data Protection**: AES-256-GCM encryption for BYOK keys
- **Headers**: CSP, HSTS, X-Frame-Options, Referrer-Policy
- **Audit Logging**: Security events, authentication, data access

## 📊 Monitoring

- **Errors**: Sentry (frontend + backend)
- **Performance**: Vercel Analytics + Web Vitals
- **Logs**: Structured JSON logging with Pino
- **Uptime**: Better Uptime / Cronitor
- **Business**: PostHog (funnels, retention, feature usage)

## 🗺 Roadmap

### Phase 1 (Months 1-3): MVP
- [x] Core roadmap with progress tracking
- [x] AI tutoring with BYOK
- [x] Quiz engine
- [x] Knowledge graph visualization
- [ ] User authentication & profiles
- [ ] Basic analytics

### Phase 2 (Months 4-8): Growth
- [ ] Spaced repetition scheduler
- [ ] Community features (notes, discussions)
- [ ] Mobile app (React Native)
- [ ] Advanced RAG with citations
- [ ] Team/workspace support

### Phase 3 (Months 9-18): Scale
- [ ] ML-powered recommendations
- [ ] Automated content pipeline
- [ ] Multi-language support
- [ ] Enterprise SSO (SAML/OIDC)
- [ ] Compliance (SOC2, GDPR)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a PR

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Prisma](https://www.prisma.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)