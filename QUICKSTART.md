# GovCon OS - Quick Start Guide

This guide will get you up and running in under 5 minutes.

## Prerequisites Check

```bash
# Check Node.js version (should be >= 20.0.0)
node --version

# Check npm version (should be >= 10.0.0)
npm --version

# Check Docker
docker --version
docker-compose --version
```

## One-Command Setup

If you have all prerequisites, run this single command to set up everything:

```bash
npm install && npm run docker:up && sleep 10 && npm run db:migrate && npm run db:seed
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo workspace (API, web, shared packages).

### 2. Start Infrastructure Services

```bash
npm run docker:up
```

This starts:
- PostgreSQL 16 with pgvector extension (port 5432)
- Redis 7 (port 6379)
- MinIO object storage (ports 9000, 9001)

**Wait 10 seconds** for services to fully initialize before proceeding.

### 3. Create Database Schema

```bash
npm run db:migrate
```

This creates all tables:
- Foundation: organizations, users, user_roles, audit_events
- Capability Evidence: capability_documents, capability_document_versions, capability_facts, company_claims
- Bid/No-Bid: bid_decisions, requirement_evidence_links

### 4. Seed Test Data

```bash
npm run db:seed
```

This creates:
- 1 organization: "Acme Defense Solutions"
- 7 users (one per role) with email/password credentials
- Default bid/no-bid scoring configuration

### 5. Start Development Servers

```bash
npm run dev
```

This starts both the API and web app in parallel:
- API: http://localhost:4000
- Web: http://localhost:3000

## Login to the Application

1. Open http://localhost:3000 in your browser
2. Use any of these credentials:

**Admin Access:**
- Email: `admin@acme-defense.com`
- Password: `Password123!`

**Capture Manager:**
- Email: `capture@acme-defense.com`
- Password: `Password123!`

**Or any other role:**
- proposal@acme-defense.com / Password123!
- technical@acme-defense.com / Password123!
- pricing@acme-defense.com / Password123!
- reviewer@acme-defense.com / Password123!
- readonly@acme-defense.com / Password123!

## Verify Setup

### Check API Health

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-12-13T..."}
```

### Check Database

```bash
docker exec -it govcon-postgres psql -U govcon -d govcon_os -c "SELECT COUNT(*) FROM users;"
```

Expected output: `7` users

### Check MinIO

Open http://localhost:9001 in your browser:
- Username: `govcon`
- Password: `govcon_minio_password`

You should see a bucket named `govcon-documents`.

## What's Next?

Now that Sprint 1 is complete, you have:

✅ Working authentication system
✅ Role-based access control
✅ Multi-tenant database schema
✅ Capability evidence locker tables
✅ Bid/no-bid scoring infrastructure
✅ Full-stack dev environment

### Try These Actions:

1. **Login as different roles** to see RBAC in action
2. **Check the API** at http://localhost:4000/api/capability-documents (requires auth)
3. **Review the schema** in apps/api/migrations/001_initial_schema.sql
4. **Run tests** with `npm test`

### Next Sprint Tasks:

- Sprint 2: Build opportunity management UI and SAM.gov integration
- Sprint 3: Document upload pipeline and text extraction
- Sprint 4: AI-powered RFP requirement extraction
- Sprint 5: Compliance matrix workspace
- Sprint 5.5: Capability evidence UI and bid/no-bid calculator

## Common Issues

### Port Already in Use

```bash
# Check what's using the port
lsof -i :4000  # API
lsof -i :3000  # Web
lsof -i :5432  # PostgreSQL

# Kill the process or change the port in .env files
```

### Docker Services Not Starting

```bash
# View logs
npm run docker:logs

# Or check individual service
docker logs govcon-postgres
docker logs govcon-redis
docker logs govcon-minio
```

### Migration Fails

```bash
# Reset database (WARNING: destroys all data)
npm run docker:down
npm run docker:up
sleep 10
npm run db:migrate
npm run db:seed
```

### Clean Slate Reset

```bash
# Complete clean reset
npm run docker:down
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
npm run docker:up
sleep 10
npm run db:migrate
npm run db:seed
npm run dev
```

## Development Workflow

```bash
# Start everything
npm run dev

# Run only API
npm run dev:api

# Run only Web
npm run dev:web

# Run tests
npm test

# View Docker logs
npm run docker:logs

# Stop Docker services
npm run docker:down
```

## Need Help?

- Read the full README.md for detailed documentation
- Check CLAUDE.md for project context and architecture
- Review the spec files for technical requirements
- Examine the code in apps/api/src and apps/web/src

---

**You're all set!** 🚀 GovCon OS Sprint 1 is complete and running.
