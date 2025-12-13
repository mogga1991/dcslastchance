# Authentication Testing Guide

## Problems Found & Fixed ✅

### 1. **Clerk vs Better Auth Conflict** ❌→✅
**Problem:** The app uses Better Auth (server-side) but sign-in and sign-up components were using Clerk (wrong library)

**Fixed:**
- ✅ Replaced `signin-page.tsx` - Now uses `authClient.signIn.email()`
- ✅ Replaced `sign-up-block.tsx` - Now uses `authClient.signUp.email()`
- ✅ Updated NEXT_PUBLIC_APP_URL from port 3000 → 3002

### 2. **Database Connection** ✅
- Database: `neondb` on Neon PostgreSQL
- All Better Auth tables exist: `user`, `session`, `account`, `verification`
- Connection tested and working

### 3. **Environment Variables** ✅
- DATABASE_URL: ✅ Connected
- NEXT_PUBLIC_APP_URL: ✅ Fixed to match running port (3002)
- BETTER_AUTH_SECRET: ✅ Configured

## How to Test Authentication

### Step 1: Sign Up
1. Navigate to: http://localhost:3002/sign-up
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
   - Confirm Password: `password123`
   - ✅ Agree to Terms
3. Click "Sign Up"
4. Should redirect to `/dashboard`

### Step 2: Sign Out (if needed)
To test sign-in, you need to sign out first:
- Open browser DevTools → Application → Cookies
- Clear cookies for localhost:3002
- Or use: `authClient.signOut()` in console

### Step 3: Sign In
1. Navigate to: http://localhost:3002/sign-in
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should redirect to `/dashboard`

### Step 4: Verify Session
Once signed in, check:
1. Dashboard loads without redirect
2. User data is displayed
3. Session persists on page refresh

## Current Auth Flow

```
Sign Up Flow:
User → /sign-up → authClient.signUp.email() → /api/auth/[...all] → Database → Session Created → /dashboard

Sign In Flow:
User → /sign-in → authClient.signIn.email() → /api/auth/[...all] → Database → Session Retrieved → /dashboard
```

## API Endpoints

### Better Auth (Auto-configured)
- POST `/api/auth/sign-up` - Create account
- POST `/api/auth/sign-in/email` - Email/password login
- POST `/api/auth/sign-out` - End session
- GET `/api/auth/session` - Get current session

### App APIs (Protected)
- GET `/api/subscription` - User subscription details
- GET `/api/analyses` - Organization's analyses
- POST `/api/analyses` - Create new analysis (requires credits)
- GET `/api/credits` - User's credits
- GET `/api/dashboard/stats` - Dashboard statistics

## Troubleshooting

### "Signing in..." stuck forever
**Cause:** Wrong credentials or account doesn't exist
**Fix:** Sign up first, then sign in

### Redirect to /sign-in when accessing /dashboard
**Cause:** No active session
**Fix:** Sign in with valid credentials

### "Failed to create account"
**Possible causes:**
1. Email already exists - try different email
2. Database connection issue - check DATABASE_URL
3. Password too short - min 8 characters

### Google OAuth not working
**Cause:** Google credentials are placeholders
**Fix:** Need to set up Google OAuth app and update `.env.local`:
```
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-secret
```

## What's Working Now ✅

1. ✅ Better Auth properly configured
2. ✅ Database connection established
3. ✅ User table ready for authentication
4. ✅ Sign-up page uses Better Auth
5. ✅ Sign-in page uses Better Auth
6. ✅ Environment variables correct
7. ✅ App running on correct port (3002)

## Next Steps (Optional)

1. **Set up Google OAuth** - Configure Google Cloud Console
2. **Email verification** - Add email verification flow
3. **Password reset** - Implement forgot password
4. **Organization creation** - Allow users to create orgs
5. **Profile setup** - Company profile wizard

## Test the Full Flow

Try this complete workflow:

```bash
# 1. Open the app
http://localhost:3002

# 2. Click "Sign Up" or go to /sign-up

# 3. Create an account
Name: John Doe
Email: john@test.com
Password: testpass123
✅ Agree to terms

# 4. Should auto-redirect to /dashboard

# 5. Verify you're logged in
- Dashboard shows welcome message
- No redirect to /sign-in

# 6. Test sign out (optional)
- Clear browser cookies OR use authClient.signOut()

# 7. Sign back in at /sign-in
Email: john@test.com
Password: testpass123

# 8. Verify session persists
- Refresh page
- Dashboard should still load
```

## Database Check

To verify user was created:
```bash
node check-user-table.js
```

Should show:
```
👥 Existing users: 1
  - john@test.com (John Doe)
```
