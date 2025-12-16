# CLAUDE.md - Project Context for AI Assistants

## Project Overview

**RLP Scout** (package name: `sentyr`) is an AI-powered property-to-opportunity matching platform for government real estate. It connects commercial property brokers with GSA lease opportunities through intelligent scoring and matching.

**Live URL:** https://www.rlpscout.ai

## Tech Stack

- **Framework:** Next.js 15 with App Router + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) with Drizzle ORM
- **Auth:** Better Auth + Google OAuth
- **AI:** OpenAI GPT-4, Anthropic SDK
- **Maps:** Mapbox GL
- **Government API:** SAM.gov Opportunities API
- **Hosting:** Vercel

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint

# Database
npx drizzle-kit push # Push schema changes
npx drizzle-kit generate # Generate migrations

# Deployment
npm run deploy       # Deploy to Vercel preview
npm run deploy:prod  # Deploy to production

# Federal Data Sync
npm run sync-federal-data  # Manual sync of federal opportunities
```

## Project Structure

```
/app                    # Next.js App Router pages and API routes
  /api                  # API route handlers
  /dashboard            # Main dashboard pages
/components             # React components (shadcn/ui based)
/lib                    # Core utilities and business logic
  /scoring              # Property-opportunity matching algorithm
  /fedspace             # Federal space analysis
  /hooks                # React hooks
/db                     # Drizzle ORM schema and migrations
```

## Key Architecture Patterns

### API Routes
- Located in `/app/api/`
- Use Next.js route handlers
- Protected routes use auth guards from `lib/auth-guards.ts`

### Database
- Drizzle ORM with Supabase PostgreSQL
- Schema defined in `/db/schema.ts`
- Client initialization in `lib/db.ts`

### Scoring System
Property matching uses a weighted 5-category algorithm:
- **Location (30%):** Distance from delineated area
- **Space (25%):** Square footage compliance
- **Building (20%):** Class, features, accessibility
- **Timeline (15%):** Availability vs occupancy date
- **Experience (10%):** Government lease history

Scoring code is in `/lib/scoring/`

### Authentication
- Better Auth with Google OAuth
- Auth utilities in `lib/auth.ts` and `lib/auth-client.ts`
- Server-side auth in `lib/supabase/server.ts`

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SAM_GOV_API_KEY` - SAM.gov API key
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token

## Testing

```bash
npm test             # Run Vitest tests
npx playwright test  # Run E2E tests
```

## Important Notes

- Use `--legacy-peer-deps` when installing dependencies
- The app uses Turbopack for development (`next dev --turbopack`)
- Federal data syncs run via cron job (`/api/cron/sync-federal-data`)
- Rate limiting configured in `lib/api-security.ts`
