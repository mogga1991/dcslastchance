# Supabase Authentication Setup

This document outlines the Supabase authentication configuration for your app.

## ✅ What's Already Implemented

### 1. **Email/Password Authentication**
- Sign up with email and password
- Sign in with email and password
- Email confirmation is DISABLED (for testing)

### 2. **Google OAuth**
- Sign up with Google
- Sign in with Google

### 3. **Auth Routes**
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/auth/callback` - OAuth callback handler

### 4. **Protected Routes**
- `/dashboard/*` - Requires authentication
- Middleware automatically redirects unauthenticated users to `/sign-in`

---

## 🔧 Supabase Configuration Required

### In Supabase Dashboard (https://supabase.com/dashboard)

#### 1. Email Settings
Navigate to: **Authentication > Email Auth**
- ✅ Enable Email provider
- ✅ **Disable** "Confirm email" (already done for testing)
- ✅ Set "Minimum password length" to 8

#### 2. Google OAuth Settings
Navigate to: **Authentication > Providers > Google**

**Required Configuration:**
- ✅ Enable Google provider
- Add your Google OAuth credentials:
  - Client ID: `[YOUR_GOOGLE_CLIENT_ID]`
  - Client Secret: `[YOUR_GOOGLE_CLIENT_SECRET]`

**Authorized Redirect URLs** (add ALL of these):
```
http://localhost:3000/auth/callback
https://dcslasttry-pbt1go3yf-mogga1991s-projects.vercel.app/auth/callback
https://your-production-domain.com/auth/callback
```

#### 3. Site URL Settings
Navigate to: **Authentication > URL Configuration**

**Site URL:**
```
https://dcslasttry-pbt1go3yf-mogga1991s-projects.vercel.app
```

**Redirect URLs** (add ALL of these):
```
http://localhost:3000/auth/callback
https://dcslasttry-pbt1go3yf-mogga1991s-projects.vercel.app/auth/callback
https://your-production-domain.com/auth/callback
```

---

## 🔐 Environment Variables

Make sure these are set in your `.env.local` (locally) and Vercel (production):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... [your anon key]
SUPABASE_SERVICE_ROLE_KEY=eyJ... [your service role key]
```

---

## 📝 Testing the Auth Flow

### Email/Password Sign Up:
1. Go to `/sign-up`
2. Enter name, email, password
3. Click "Sign up"
4. Should redirect to `/dashboard` (no email confirmation needed)

### Email/Password Sign In:
1. Go to `/sign-in`
2. Enter email and password
3. Click "Sign in"
4. Should redirect to `/dashboard`

### Google OAuth:
1. Go to `/sign-in` or `/sign-up`
2. Click "Continue with Google"
3. Authenticate with Google
4. Should redirect back to `/auth/callback`
5. Then redirect to `/dashboard`

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid OAuth callback URL"
**Solution:** Make sure `/auth/callback` is added to Supabase's Redirect URLs

### Issue: Google OAuth doesn't work
**Solution:**
1. Verify Google OAuth credentials in Supabase dashboard
2. Check that redirect URLs match exactly (including http/https)
3. Make sure Google Cloud Console has the same redirect URLs

### Issue: Users can access dashboard without logging in
**Solution:**
1. Check that middleware is running
2. Verify Supabase session cookies are being set
3. Check browser console for errors

### Issue: "Error fetching subscription details"
**Solution:** This is a build warning, not a runtime error. It's safe to ignore for now.

---

## 📊 User Table Structure

Your `users` table should have these columns (auto-created by Supabase Auth):
- `id` (UUID)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Additional metadata from sign-up form is stored in `raw_user_meta_data`:
- `name` - User's full name from sign-up form

---

## 🔄 Session Management

- Sessions are stored in HTTP-only cookies
- Middleware checks session on every request
- Sessions are automatically refreshed
- Protected routes redirect to `/sign-in` if no session

---

## 🎯 Next Steps

1. ✅ Configure Google OAuth in Supabase (if not done)
2. ✅ Add redirect URLs to Supabase
3. ✅ Test sign-up flow
4. ✅ Test sign-in flow
5. ✅ Test Google OAuth
6. Add password reset functionality (future)
7. Add email verification (future - when ready for production)
