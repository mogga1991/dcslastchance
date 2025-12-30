# FedSpace

Commercial real estate platform connecting property owners with federal government leasing opportunities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
./dev.sh
```

**⚠️ IMPORTANT:** Always use `./dev.sh` instead of `npm run dev`

This prevents shell environment variable conflicts with the SAM.gov API key.

## 📖 Documentation

See [CLAUDE.md](CLAUDE.md) for complete project documentation, including:
- Architecture overview
- SAM.gov API integration
- Common issues and solutions
- Deployment instructions

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required variables:
- `SAM_API_KEY` - SAM.gov API key for federal opportunities
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `DATABASE_URL` - Neon PostgreSQL connection string

## 🛠️ Common Commands

```bash
./dev.sh              # Start development server (port 3002)
npm run build         # Production build
npm run lint          # ESLint check
vercel --prod         # Deploy to production
```

## 🚨 Troubleshooting

**"401 API_KEY_INVALID" errors?**

Run the environment diagnostic tool:
```bash
node check-env.js
```

This will check for conflicts between shell environment variables and `.env.local`.

Quick fixes:
- Make sure you're using `./dev.sh` and not `npm run dev`
- Check that `SAM_API_KEY` is set in `.env.local`
- Close terminal and open a new one to clear shell env vars
- Verify the key is valid at https://sam.gov

See [CLAUDE.md](CLAUDE.md) for detailed troubleshooting.

## 📁 Project Structure

```
/app                  # Next.js app router pages
  /dashboard         # Broker dashboard pages
    /my-properties   # Property listings page
    /gsa-leasing     # GSA opportunities page
  /api              # API routes
/lib                 # Shared utilities
  /sam-gov.ts       # SAM.gov API client
/components          # Reusable components
/supabase           # Database migrations
```

## 🔗 Links

- **Production:** [Your Vercel URL]
- **Supabase Dashboard:** https://supabase.com/dashboard
- **SAM.gov API:** https://open.gsa.gov/api/opportunities-api/
