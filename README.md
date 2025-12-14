# RLP Scout

**AI-Powered Property-to-Opportunity Matching Platform for Government Real Estate**

RLP Scout is a comprehensive platform that connects commercial property brokers with GSA lease opportunities through intelligent matching and scoring, helping brokers identify the best government contracting opportunities for their properties.

🌐 **Live at:** [www.rlpscout.ai](https://www.rlpscout.ai)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECH STACK                                  │
├─────────────────────────────────────────────────────────────────┤
│  Frontend          Next.js 15 + React 19 + Tailwind CSS        │
│  Authentication    Better Auth + Google OAuth                   │
│  Database          Supabase (PostgreSQL 16)                     │
│  Storage           Supabase Storage                             │
│  AI/ML             OpenAI GPT-4 for analysis                    │
│  Maps              Google Maps API                              │
│  Government API    SAM.gov Opportunities API                    │
│  Hosting           Vercel (Production)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  SCORING SYSTEM                                  │
├─────────────────────────────────────────────────────────────────┤
│  Location (30%)    Distance from delineated area               │
│  Space (25%)       Square footage compliance                    │
│  Building (20%)    Class, features, accessibility              │
│  Timeline (15%)    Availability vs. occupancy date             │
│  Experience (10%)  Gov lease history, certifications           │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### ✅ Core Platform

- **Property-to-Opportunity Matching**: Intelligent scoring system (0-100 scale with A-F grades)
- **GSA Lease Opportunities**: Real-time sync with SAM.gov API
- **Broker Profiles**: Track government lease experience and certifications
- **Property Listings**: Comprehensive property management with location, space, and building details
- **Smart Filtering**: Filter opportunities by location, NAICS code, set-aside type
- **Authentication**: Google OAuth integration via Better Auth
- **Dashboard Analytics**: Track opportunities, proposals, and match scores

### 🎯 Scoring System

The platform uses a weighted scoring algorithm to match properties against government requirements:

| Category   | Weight | What It Measures                      |
|------------|--------|---------------------------------------|
| Location   | 30%    | Distance from delineated area         |
| Space      | 25%    | Square footage compliance             |
| Building   | 20%    | Class, features, accessibility        |
| Timeline   | 15%    | Availability vs. occupancy date       |
| Experience | 10%    | Gov lease history, certifications     |

**Grade Scale:**
- **A (85-100)**: Excellent match, highly competitive
- **B (70-84)**: Good match, competitive
- **C (55-69)**: Fair match, may need adjustments
- **D (40-54)**: Weak match, significant gaps
- **F (0-39)**: Poor match, likely not viable

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase account (for database)
- Google Cloud account (for OAuth and Maps)
- SAM.gov API key (for opportunities)

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd dcslasttry

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Update .env.local with your credentials
# - Supabase URL and keys
# - Google OAuth credentials
# - Google Maps API key
# - SAM.gov API key
# - OpenAI API key

# 5. Link to Supabase project
supabase link

# 6. Push database migrations
supabase db push

# 7. Start development server
npm run dev
```

This will start:
- **Web App**: http://localhost:3002
- **API Routes**: http://localhost:3002/api/*

### Authentication

Sign in with Google OAuth - no default credentials needed.

## Project Structure

```
govcon-os/
├── apps/
│   ├── api/                      # Fastify backend
│   │   ├── migrations/          # SQL migrations
│   │   ├── src/
│   │   │   ├── lib/            # Database, Redis, MinIO, Auth
│   │   │   ├── middleware/     # RBAC middleware
│   │   │   ├── routes/         # API routes
│   │   │   ├── scripts/        # Migrate, seed scripts
│   │   │   ├── tests/          # Test suites
│   │   │   └── index.ts        # Server entry point
│   │   └── package.json
│   │
│   ├── web/                     # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   └── lib/            # API client, auth context
│   │   └── package.json
│   │
│   └── worker/                  # Background jobs (future)
│
├── packages/
│   └── shared/                  # Shared code
│       ├── src/
│       │   ├── types.ts        # TypeScript types
│       │   ├── schemas.ts      # Zod validation schemas
│       │   └── index.ts
│       └── package.json
│
├── docker-compose.yml           # Infrastructure services
├── package.json                 # Root workspace config
└── README.md
```

## Database Schema (Sprint 1)

### Foundation Tables

- `organizations` - Multi-tenant organizations
- `users` - User accounts
- `user_roles` - RBAC role assignments
- `audit_events` - Audit trail

### Capability Evidence Locker (Addendum A)

- `capability_documents` - Uploaded capability documents
- `capability_document_versions` - Document version control
- `capability_facts` - Extracted facts with citations
- `company_claims` - Evidence-backed capability claims

### Bid/No-Bid Scoring (Addendum A)

- `bid_decisions` - Bid/no-bid decisions with scoring
- `requirement_evidence_links` - Links RFP requirements to capability evidence

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Capability Documents

- `POST /api/capability-documents` - Upload document
- `GET /api/capability-documents` - List documents
- `POST /api/capability-documents/:id/versions` - Upload version

### Capability Facts

- `GET /api/capability-facts` - List facts
- `PATCH /api/capability-facts/:id/verify` - Verify fact

### Company Claims

- `POST /api/company-claims` - Create claim
- `GET /api/company-claims` - List claims
- `PATCH /api/company-claims/:id` - Update claim

## Available Scripts

```bash
# Development
npm run dev              # Start API + Web in parallel
npm run dev:api          # Start API only
npm run dev:web          # Start Web only

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database

# Docker
npm run docker:up        # Start infrastructure
npm run docker:down      # Stop infrastructure
npm run docker:logs      # View logs

# Testing
npm run test             # Run all tests
npm run lint             # Lint code

# Production
npm run build            # Build all apps
npm run clean            # Clean node_modules
```

## Environment Variables

### API (apps/api/.env)

```bash
# Server
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your_secret_key_change_in_production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=govcon_os
DB_USER=govcon
DB_PASSWORD=govcon_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=govcon
MINIO_SECRET_KEY=govcon_minio_password
```

### Web (apps/web/.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Testing

```bash
# Run all tests
npm run test

# Run API tests only
cd apps/api && npm test

# Run specific test file
cd apps/api && npm test -- rbac.test.ts
```

Test suites:
- `rbac.test.ts` - Role-based access control
- `tenancy.test.ts` - Multi-tenant isolation

## RBAC Roles

| Role | Level | Permissions |
|------|-------|-------------|
| `admin` | 100 | Full system access |
| `capture` | 80 | Manage opportunities, capability docs |
| `proposal` | 70 | Manage proposals, compliance matrices |
| `technical` | 50 | Write technical sections |
| `pricing` | 50 | Manage pricing data |
| `reviewer` | 30 | Review and comment |
| `readonly` | 10 | Read-only access |

## Troubleshooting

### Docker services not starting

```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9000  # MinIO

# Restart services
npm run docker:down
npm run docker:up
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs govcon-postgres

# Reconnect
npm run docker:down
npm run docker:up
sleep 10
npm run db:migrate
```

### Migration errors

```bash
# Drop and recreate database (WARNING: destroys data)
docker exec -it govcon-postgres psql -U govcon -c "DROP DATABASE IF EXISTS govcon_os;"
docker exec -it govcon-postgres psql -U govcon -c "CREATE DATABASE govcon_os;"
npm run db:migrate
npm run db:seed
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions to **www.rlpscout.ai**.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Configure Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add `www.rlpscout.ai`
3. Update DNS records (see DEPLOYMENT_GUIDE.md)
4. Wait for SSL certificate provisioning

## Roadmap

### ✅ Phase 1 - Core Platform (COMPLETE)
- Next.js 15 application
- Supabase authentication & database
- SAM.gov opportunity sync
- Dashboard with opportunity filters
- Broker listing page

### ✅ Phase 2 - Scoring System (COMPLETE)
- Property database schema
- Broker profile schema
- 5-category weighted scoring algorithm
- PropertyMatchScore UI component
- API endpoint for score calculation
- Score caching (24-hour TTL)

### 🚧 Phase 3 - Property Management
- Property listing creation UI
- Broker profile onboarding
- Image upload for properties
- Floor plan management
- Document storage

### 🚧 Phase 4 - Enhanced Matching
- AI-powered requirement extraction from RFPs
- Automatic geocoding for delineated areas
- Email notifications for high-scoring matches
- Weekly digest of new opportunities

### 🚧 Phase 5 - Collaboration
- Team management for brokers
- Shared property portfolios
- Internal notes on opportunities
- Lead management system

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact the development team.

---

**Built with evidence-based architecture.** Every claim needs a citation.
