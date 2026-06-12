# AI Engineer Roadmap - Architecture Specification

## 1. Technology Stack Justification

### Frontend
- **Next.js 14+ (App Router)** - React Server Components, streaming, built-in optimization
- **TypeScript 5+** - Type safety across full stack
- **Tailwind CSS** - Utility-first, tree-shakable, dark mode native
- **Radix UI + shadcn/ui** - Accessible, unstyled primitives
- **Zustand** - Lightweight global state (auth, theme, user progress)
- **TanStack Query** - Server state, caching, optimistic updates
- **React Flow** - Knowledge graph visualization
- **Framer Motion** - Animations
- **MDX** - Interactive content rendering

### Backend
- **Next.js API Routes** - Unified full-stack, edge-ready
- **tRPC** - End-to-end type safety (alternative to REST)
- **Zod** - Runtime validation
- **Prisma ORM** - Type-safe database access
- **NextAuth.js v5** - Authentication with RBAC

### Database
- **PostgreSQL (Neon/Supabase)** - Relational, JSONB for flexible content, pgvector for embeddings
- **Redis (Upstash)** - Caching, rate limiting, session store

### AI/ML
- **Vercel AI SDK** - Streaming, tool calling, RAG primitives
- **LangChain.js** - RAG pipelines, vector stores
- **OpenAI/Anthropic/Gemini** - BYOK model providers
- **pgvector** - Embedding storage in Postgres

### Infrastructure
- **Vercel** - Edge functions, preview deployments, analytics
- **Docker** - Local dev parity, CI/CD
- **GitHub Actions** - CI/CD pipelines
- **Sentry** - Error tracking
- **PostHog** - Product analytics

---

## 2. Database Schema

```sql
-- Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  name VARCHAR(255),
  image TEXT,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL
);

-- API Keys (BYOK)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning Content
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'topic', 'concept', 'project', 'quiz', 'resource'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_mdx TEXT,
  position_x FLOAT,
  position_y FLOAT,
  order_index INTEGER DEFAULT 0,
  estimated_hours FLOAT,
  difficulty VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  prerequisites UUID[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  source_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'prerequisite',
  label VARCHAR(100)
);

-- User Progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'locked', -- 'locked', 'available', 'in_progress', 'completed', 'mastered'
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, node_id)
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Tutoring
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  title VARCHAR(255),
  model_provider VARCHAR(50),
  model_name VARCHAR(100),
  system_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
  content TEXT,
  tool_calls JSONB,
  tool_call_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RAG / Knowledge Base
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  content_hash VARCHAR(64),
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_node ON user_progress(node_id);
CREATE INDEX idx_nodes_roadmap ON nodes(roadmap_id);
CREATE INDEX idx_messages_session ON messages(session_id);
```

---

## 3. API Architecture

### tRPC Routers (Type-Safe)
```
app/api/trpc/[trpc]/route.ts
├── auth.router.ts        # login, register, session, api-keys
├── roadmap.router.ts     # CRUD, publish, versioning
├── node.router.ts        # CRUD, reorder, dependencies
├── progress.router.ts    # get, update, bulk-update
├── quiz.router.ts        # generate, submit, review
├── chat.router.ts        # sessions, messages, streaming
├── rag.router.ts         # search, ingest, delete
└── user.router.ts        # profile, subscription, settings
```

### REST Endpoints (Webhooks, Public)
```
POST   /api/webhooks/stripe
POST   /api/webhooks/clerk
GET    /api/roadmaps/[slug]/public
GET    /api/health
```

---

## 4. Authentication & RBAC

### Roles
- **admin** - Full access, user management, content moderation
- **author** - Create/edit roadmaps, publish content
- **premium** - Full AI access, unlimited quizzes, advanced analytics
- **user** - Standard access, limited AI credits
- **guest** - Read-only public roadmaps

### Permissions Matrix
| Action | admin | author | premium | user | guest |
|--------|-------|--------|---------|------|-------|
| Read public roadmaps | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create roadmap | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit own roadmap | ✓ | ✓ | ✗ | ✗ | ✗ |
| Publish roadmap | ✓ | ✓ | ✗ | ✗ | ✗ |
| AI Tutoring (BYOK) | ✓ | ✓ | ✓ | ✓* | ✗ |
| AI Tutoring (Managed) | ✓ | ✓ | ✓ | ✗ | ✗ |
| Unlimited Quizzes | ✓ | ✓ | ✓ | ✗ | ✗ |
| Export Progress | ✓ | ✓ | ✓ | ✓ | ✗ |

*With rate limits

---

## 5. Security Architecture

### Defense Layers
1. **Network** - Vercel Edge WAF, rate limiting
2. **Application** - NextAuth.js, CSRF tokens, secure headers
3. **API** - Zod validation, tRPC middleware, rate limiting
4. **Database** - Parameterized queries (Prisma), RLS policies
5. **Secrets** - Vercel Encrypted Env, AES-256 for API keys

### OWASP Top 10 Mitigations
- **A01 Broken Access Control** - RBAC middleware on every procedure
- **A02 Cryptographic Failures** - TLS 1.3, bcrypt/argon2, encrypted API keys
- **A03 Injection** - Prisma ORM, Zod validation, no raw SQL
- **A04 Insecure Design** - Threat modeling, security reviews
- **A05 Security Misconfiguration** - Security headers, CSP, HSTS
- **A06 Vulnerable Components** - Dependabot, npm audit, SBOM
- **A07 Auth Failures** - NextAuth v5, MFA support, session rotation
- **A08 Software Integrity** - Signed commits, provenance, lockfiles
- **A09 Logging Failures** - Structured logging, Sentry, audit trails
- **A10 SSRF** - Allowlist fetch URLs, no user-controlled destinations

---

## 6. Performance Strategy

### Core Web Vitals Targets
- LCP < 2.5s (Server Components, streaming, image optimization)
- FID < 100ms (minimal JS, code splitting)
- CLS < 0.1 (reserved space, font display swap)
- TTFB < 600ms (Edge functions, caching)

### Caching Layers
| Layer | Technology | TTL | Invalidation |
|-------|------------|-----|--------------|
| CDN | Vercel Edge | 1yr (static) | Deploy |
| API | TanStack Query | 5min | Mutation |
| Database | Redis | 1hr | Event-driven |
| AI | Vercel KV | 24hr | Manual |

### Database Optimization
- Connection pooling (PgBouncer via Neon)
- Composite indexes on query patterns
- Materialized views for analytics
- Partitioning for messages table (by month)

---

## 7. DevOps & Deployment

### Environments
```
development → preview (PR) → staging → production
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
1. lint & typecheck
2. unit tests (Vitest)
3. integration tests (Testcontainers)
4. e2e tests (Playwright)
5. build & docker build
6. deploy preview (Vercel)
7. deploy staging (manual)
8. deploy production (manual + approval)
```

### Monitoring Stack
- **Errors**: Sentry (frontend + backend)
- **Performance**: Vercel Analytics + Web Vitals
- **Logs**: Vercel Logs + Pino structured logging
- **Uptime**: Better Uptime / Cronitor
- **Business**: PostHog (funnels, retention)

---

## 8. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Vitest + React Testing Library | 80% |
| Integration | Vitest + Testcontainers (Postgres) | 70% |
| E2E | Playwright | Critical paths |
| API | tRPC + Vitest | 90% |
| Performance | k6 | Load benchmarks |
| Visual | Playwright + Percy | UI regression |

---

## 9. Scalability Roadmap

### Phase 1 (Months 1-3): MVP
- Single-region Vercel + Neon
- 10K users, basic AI tutoring
- Manual content creation

### Phase 2 (Months 4-8): Growth
- Multi-region (Edge)
- Redis caching layer
- Automated content pipeline
- 100K users

### Phase 3 (Months 9-18): Scale
- Read replicas
- Background job queue (Inngest/Trigger.dev)
- ML-powered recommendations
- 1M+ users

### Phase 4 (18+): Enterprise
- Multi-tenancy (organizations)
- SSO (SAML/OIDC)
- Advanced analytics
- Compliance (SOC2, GDPR)

---

## 10. Implementation Plan (Step-by-Step)

### Week 1: Foundation
- [ ] Initialize Next.js + TypeScript + Tailwind
- [ ] Configure ESLint, Prettier, Husky
- [ ] Set up Prisma + PostgreSQL (Neon local)
- [ ] Configure NextAuth.js with credentials + OAuth
- [ ] Create base UI components (Button, Card, Input, etc.)

### Week 2: Auth & Core Domain
- [ ] Implement RBAC middleware
- [ ] Build user API key management (BYOK encryption)
- [ ] Create roadmap/node CRUD APIs
- [ ] Build progress tracking system

### Week 3: AI Integration
- [ ] Set up Vercel AI SDK streaming
- [ ] Implement chat sessions with persistence
- [ ] Build RAG pipeline (ingest, embed, search)
- [ ] Create AI tutor system prompts

### Week 4: Learning Features
- [ ] Interactive roadmap visualization (React Flow)
- [ ] Quiz engine (generation, submission, review)
- [ ] Study planner with spaced repetition
- [ ] Knowledge graph exploration

### Week 5: Polish & Deploy
- [ ] Theme system, accessibility audit
- [ ] SEO optimization (sitemap, metadata, OG)
- [ ] Comprehensive test suite
- [ ] Docker + CI/CD + Production deploy
- [ ] Documentation & runbooks