# Deployment Guide

This guide will help you deploy your Next.js SaaS application to Vercel and configure all necessary services.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project (sign up at https://supabase.com)
3. A Polar.sh account for subscriptions (sign up at https://polar.sh)
4. Google OAuth credentials (optional, for Google sign-in)
5. OpenAI API key (optional, for AI features)

## Step 1: Database Setup

### Neon PostgreSQL Setup

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy your connection string (it will look like: `postgresql://user:password@host/database`)
4. Save this for later - you'll need it as `DATABASE_URL`

Alternatively, you can use your existing Supabase PostgreSQL database by using the connection string from Supabase.

## Step 2: Supabase Setup

### Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. The migration files will automatically create an "uploads" bucket
4. Or manually create a bucket named "uploads"
5. Configure bucket permissions:
   - Enable public access for uploaded files (or keep private based on your needs)
   - File size limit: 50MB
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/svg+xml

### Run Migrations

```bash
# Link your Supabase project
export SUPABASE_ACCESS_TOKEN=your_access_token
supabase link --project-ref your-project-ref

# Push migrations to Supabase
supabase db push
```

## Step 3: Polar.sh Setup (Subscriptions)

1. Create a Polar.sh account in sandbox mode
2. Create your subscription products:
   - Go to Products
   - Create a "Starter" tier
   - Note the Product ID and Slug
3. Generate an Access Token:
   - Go to Settings → API
   - Create a new access token
   - Copy the token
4. Set up webhook:
   - Go to Settings → Webhooks
   - Add webhook endpoint: `https://your-domain.vercel.app/api/auth/webhook/polar`
   - Generate webhook secret
   - Select events: all subscription events

## Step 4: Google OAuth Setup (Optional)

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 6: Configure Environment Variables in Vercel

In your Vercel project settings, add the following environment variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://your-neon-database-url

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Authentication
BETTER_AUTH_SECRET=generate-a-random-string-at-least-32-characters

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Optional Variables (Add when ready)

```env
# Polar.sh (Subscriptions)
POLAR_ACCESS_TOKEN=your-polar-access-token
POLAR_WEBHOOK_SECRET=your-webhook-secret
POLAR_SUCCESS_URL=success
NEXT_PUBLIC_STARTER_TIER=your-starter-product-id
NEXT_PUBLIC_STARTER_SLUG=your-starter-slug

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=your-posthog-host
```

## Step 7: Update OAuth Callbacks

After your first deployment, update your OAuth provider settings:

### Google OAuth
- Add authorized redirect URI: `https://your-actual-domain.vercel.app/api/auth/callback/google`

### Polar.sh
- Update webhook URL: `https://your-actual-domain.vercel.app/api/auth/webhook/polar`

## Step 8: Verify Deployment

1. Visit your deployed URL
2. Test the following:
   - Homepage loads correctly
   - Sign up with Google OAuth
   - Upload an image to test Supabase storage
   - Try the AI chat feature
   - Test subscription flow (if Polar.sh is configured)

## Troubleshooting

### Build Failures

If your build fails, check:
- All required environment variables are set
- Database connection string is correct
- Supabase credentials are valid

### Authentication Issues

If authentication doesn't work:
- Verify `BETTER_AUTH_SECRET` is set and at least 32 characters
- Check OAuth redirect URIs match your deployment URL
- Ensure `NEXT_PUBLIC_APP_URL` matches your actual domain

### Database Connection Issues

- Verify your DATABASE_URL is correct
- Check if your Neon database allows connections from Vercel IPs
- Ensure Supabase credentials are correct

### Subscription Issues

- Verify Polar.sh is in the correct mode (sandbox vs production)
- Check webhook secret matches
- Ensure product IDs and slugs are correct

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your project settings
- Monitor performance and errors

### Supabase Logs
- Check Supabase logs for database errors
- Monitor storage usage

### Polar.sh Dashboard
- Monitor subscription events
- Check webhook delivery status

## Production Checklist

Before going to production:

- [ ] Generate a secure `BETTER_AUTH_SECRET` (use a password generator)
- [ ] Switch Polar.sh from sandbox to production mode
- [ ] Update all OAuth redirect URIs to production domain
- [ ] Enable production mode for all third-party services
- [ ] Set up proper error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure custom domain in Vercel
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Test all features thoroughly
- [ ] Set up database backups
- [ ] Configure rate limiting if needed

## Updating Your Deployment

When you push changes to your main branch:
- Vercel automatically deploys the changes
- Environment variables persist across deployments
- Database migrations need to be run manually via `supabase db push`

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Polar.sh Documentation](https://docs.polar.sh)
- [Better Auth Documentation](https://better-auth.com)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console for errors
4. Verify all environment variables are set correctly
