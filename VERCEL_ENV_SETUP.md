# Vercel Environment Variables Setup Guide

This guide will help you configure all necessary environment variables in Vercel to enable full authentication and database functionality.

## Required Environment Variables

### 1. Database Configuration

**`DATABASE_URL`**
- **Description**: PostgreSQL connection string for Neon database
- **Format**: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
- **Where to get it**: From your Neon dashboard
- **Example**: `postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. Clerk Authentication (Option 1)

**`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
- **Description**: Public key for Clerk authentication (client-side)
- **Where to get it**: Clerk Dashboard → API Keys
- **Format**: `pk_test_...` or `pk_live_...`

**`CLERK_SECRET_KEY`**
- **Description**: Secret key for Clerk authentication (server-side)
- **Where to get it**: Clerk Dashboard → API Keys
- **Format**: `sk_test_...` or `sk_live_...`
- **⚠️ Important**: Keep this secret! Never expose in client code

### 3. Better Auth (Option 2 - Alternative to Clerk)

**`BETTER_AUTH_SECRET`**
- **Description**: Secret key for Better Auth authentication
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Format**: Random 32-character string
- **Example**: `your-super-secret-32-character-string-here`

**`BETTER_AUTH_URL`**
- **Description**: Base URL for Better Auth
- **Format**: Your production URL
- **Example**: `https://dcslasttry.vercel.app`

### 4. Optional but Recommended

**`NEXT_PUBLIC_SUPABASE_URL`** (if using Supabase features)
- **Description**: Supabase project URL
- **Where to get it**: Supabase Dashboard → Project Settings → API
- **Format**: `https://your-project.supabase.co`

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (if using Supabase features)
- **Description**: Supabase anonymous/public key
- **Where to get it**: Supabase Dashboard → Project Settings → API
- **Format**: Long JWT token starting with `eyJ...`

**`STRIPE_SECRET_KEY`** (if using payments)
- **Description**: Stripe secret key for payment processing
- **Where to get it**: Stripe Dashboard → Developers → API Keys
- **Format**: `sk_test_...` or `sk_live_...`

**`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (if using payments)
- **Description**: Stripe publishable key
- **Where to get it**: Stripe Dashboard → Developers → API Keys
- **Format**: `pk_test_...` or `pk_live_...`

---

## Step-by-Step Setup in Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. **Navigate to Your Project**
   - Go to https://vercel.com/dashboard
   - Select your project: `dcslasttry`

2. **Open Environment Variables Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add Each Variable**
   - Click "Add New" button
   - Enter the variable name (e.g., `DATABASE_URL`)
   - Enter the variable value
   - Select environment(s): Production, Preview, Development
   - Click "Save"

4. **Redeploy**
   - After adding all variables, go to "Deployments" tab
   - Click the ⋮ menu on the latest deployment
   - Click "Redeploy"

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add BETTER_AUTH_SECRET production

# Deploy with new environment variables
vercel --prod
```

---

## Quick Setup Checklist

### Minimum Required for Basic Deployment
- [ ] `DATABASE_URL` - From Neon database

### For Clerk Authentication
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`

### For Better Auth Authentication
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL`

### For Full Features
- [ ] All database variables
- [ ] All auth variables (Clerk OR Better Auth)
- [ ] `STRIPE_SECRET_KEY` (if using payments)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using payments)

---

## Getting Your Keys

### Neon Database

1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. Make sure to select "Pooled connection" for Vercel deployments

### Clerk

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to "API Keys" in the left sidebar
4. Copy both publishable and secret keys
5. Make sure you're using the correct environment (Test vs Production)

### Better Auth

```bash
# Generate a secure secret
openssl rand -base64 32
```

### Stripe

1. Go to https://dashboard.stripe.com
2. Click "Developers" in the top navigation
3. Click "API keys" in the left sidebar
4. Copy both publishable and secret keys
5. Use test keys for development, live keys for production

---

## Verification

After setting up environment variables and redeploying:

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments → Latest deployment
   - Click "Building" to see build logs
   - Ensure no environment variable errors

2. **Test Authentication**
   - Visit your site: https://dcslasttry.vercel.app/sign-up
   - Try signing up with a test account
   - Verify you can sign in and access protected pages

3. **Test Database Connection**
   - Visit a page that requires database (e.g., /dashboard)
   - Check if data loads correctly
   - No connection errors in browser console

---

## Troubleshooting

### Build fails with "DATABASE_URL is not set"
- Verify variable name is exactly `DATABASE_URL` (case-sensitive)
- Ensure variable is set for "Production" environment
- Redeploy after adding the variable

### "Missing publishableKey" error
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Verify it starts with `pk_test_` or `pk_live_`
- Environment variables starting with `NEXT_PUBLIC_` are required for client-side code

### Authentication not working
- Check both publishable and secret keys are set
- Verify keys are from the same Clerk application
- Make sure you're using the correct environment (test vs production)

### Changes not reflected after deployment
- Environment variables only take effect after redeployment
- Always redeploy after changing environment variables
- Clear browser cache and try again

---

## Security Best Practices

1. **Never commit secrets to git**
   - All secret keys should only be in Vercel environment variables
   - Never in your code or `.env` files committed to GitHub

2. **Use different keys for development and production**
   - Test keys for development/preview
   - Live keys for production only

3. **Rotate keys periodically**
   - Change secrets every 3-6 months
   - Immediately rotate if compromised

4. **Limit permissions**
   - Use least privilege principle
   - Database users should have minimal required permissions

---

## Next Steps After Setup

Once all environment variables are configured:

1. Redeploy your application
2. Test all authentication flows
3. Verify database connections
4. Test payment processing (if applicable)
5. Monitor error logs for any issues

---

## Support

If you encounter issues:
- Check Vercel build logs for specific error messages
- Review Clerk/Neon/Stripe documentation
- Ensure all required variables are set correctly
- Verify variable values are copied correctly (no extra spaces)

---

**Last Updated**: December 2024
