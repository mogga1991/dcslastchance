# 🔒 URGENT: Credential Rotation Checklist

**Date Created:** December 15, 2024
**Status:** ⚠️ CRITICAL ACTION REQUIRED

---

## ⚠️ WHY THIS IS URGENT

Your `.env.local` file contains production credentials with full access to:
- ✅ Database (read/write/delete all data)
- ✅ User authentication system
- ✅ Paid API services (OpenAI, Google Maps)
- ✅ OAuth systems

**Good News:** `.env.local` is NOT in git history (verified ✅)

**Action Required:** Rotate credentials as a security best practice since the file exists locally.

---

## 📋 CREDENTIAL ROTATION CHECKLIST

### 1. Supabase Credentials

#### A. Service Role Key (HIGHEST PRIORITY)
**Current Key Location:** `.env.local` line 7
**Risk Level:** 🔴 CRITICAL - Full admin access to database

**Steps:**
- [ ] Go to https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm/settings/api
- [ ] Navigate to "Service Role" section
- [ ] Click "Reset Service Role Key"
- [ ] Copy new key to secure password manager
- [ ] Update production environment variables (Vercel/deployment platform)
- [ ] Update `.env.local` with new key
- [ ] Test that application still works
- [ ] ✅ Confirm old key is revoked

#### B. Supabase Access Token
**Current Key Location:** `.env.local` line 2
**Risk Level:** 🟠 HIGH - CLI admin access

**Steps:**
- [ ] Go to https://supabase.com/dashboard/account/tokens
- [ ] Revoke token: `sbp_e006194037d8ae8051892dd89915bd627ad37861`
- [ ] Generate new access token
- [ ] Update `.env.local` line 2
- [ ] Test: `supabase link` command still works
- [ ] ✅ Confirmed

#### C. Anon Key
**Current Key Location:** `.env.local` line 6
**Risk Level:** 🟡 MEDIUM - Public key, but should rotate if others were compromised

**Steps:**
- [ ] If Service Role was compromised, rotate this too
- [ ] Same location as service role key in Supabase dashboard
- [ ] Update `.env.local` and production

---

### 2. OpenAI API Key

**Current Key Location:** `.env.local` lines 27-28
**Risk Level:** 🟠 HIGH - Paid API access

**Steps:**
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Find key: `sk-proj-Z-0ytYn8xgXs...` (partial shown for security)
- [ ] Click "Revoke" on the compromised key
- [ ] Create new secret key
- [ ] Update `.env.local` line 27 (remove line 28 - duplicate)
- [ ] Update production environment variables
- [ ] Test OpenAI functionality in app
- [ ] ✅ Confirmed

---

### 3. Google OAuth Credentials

**Current Credentials:** `.env.local` lines 23-24
**Risk Level:** 🟠 HIGH - OAuth impersonation risk

**Steps:**
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Select project with Client ID: `451355945244-9hr326kqango0em7a011vq3vm8k3smlv`
- [ ] Click on OAuth 2.0 Client ID
- [ ] Delete the compromised client
- [ ] Create new OAuth 2.0 Client ID
- [ ] Configure authorized redirect URIs
- [ ] Copy new Client ID and Secret
- [ ] Update `.env.local` lines 23-24
- [ ] Update production environment variables
- [ ] Test Google OAuth login
- [ ] ✅ Confirmed

---

### 4. Google Maps API Key

**Current Key Location:** `.env.local` lines 31-32
**Risk Level:** 🟡 MEDIUM - Quota abuse risk

**Steps:**
- [ ] Go to https://console.cloud.google.com/google/maps-apis/credentials
- [ ] Find key: `AIzaSyCuqnLAx_kSUMprV1KQICPSCwF1uj-IbwY`
- [ ] Click "Delete" or "Regenerate"
- [ ] Create new API key
- [ ] Add API restrictions (Maps JavaScript API, Geocoding API, etc.)
- [ ] Add application restrictions (HTTP referrers for your domains)
- [ ] Update `.env.local` line 31 (remove line 32 - duplicate)
- [ ] Update production environment variables
- [ ] Test map functionality
- [ ] ✅ Confirmed

---

### 5. SAM.gov API Key

**Current Key Location:** `.env.local` lines 39-40
**Risk Level:** 🟡 MEDIUM - 1,000 requests/day quota

**Steps:**
- [ ] Go to https://sam.gov/data-services/Account/API
- [ ] Delete key: `SAM-14274bd4-8901-4223-812b-645db7055ac0`
- [ ] Generate new API key
- [ ] Update `.env.local` line 39 (remove line 40 - duplicate)
- [ ] Update production environment variables
- [ ] Test SAM.gov opportunity search
- [ ] ✅ Confirmed

---

### 6. Database Connection String (Neon)

**Current Location:** `.env.local` line 13
**Risk Level:** 🔴 CRITICAL - Direct database access

**Steps:**
- [ ] Go to https://console.neon.tech
- [ ] Navigate to your project
- [ ] Go to Settings > Reset Password
- [ ] Generate new password for `neondb_owner` user
- [ ] Copy new connection string
- [ ] Update `.env.local` line 13
- [ ] Update production environment variables
- [ ] Test database connection
- [ ] ✅ Confirmed

---

### 7. Cron Job Secret

**Current Location:** `.env.local` line 43
**Risk Level:** 🟡 MEDIUM - Unauthorized job execution

**Steps:**
- [ ] Generate new random secret: `openssl rand -base64 32`
- [ ] Update `.env.local` line 43
- [ ] Update production environment variables
- [ ] Update any cron job configurations (Vercel Cron, etc.)
- [ ] ✅ Confirmed

---

## 🔧 CLEANUP TASKS

### Remove Duplicate VITE Variables
`.env.local` contains `VITE_*` variables for Vite framework, but this is a Next.js app.

**Remove these lines:**
- [ ] Line 28: `VITE_OPENAI_API_KEY`
- [ ] Line 32: `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Line 40: `VITE_SAMGOV_API_KEY`

---

## 📝 PRODUCTION DEPLOYMENT CHECKLIST

After rotating credentials, update them in your production environment:

### Vercel
- [ ] Go to https://vercel.com/[your-project]/settings/environment-variables
- [ ] Update all rotated credentials
- [ ] Redeploy application

### Railway / Render / Other
- [ ] Update environment variables in platform dashboard
- [ ] Redeploy application

---

## ✅ VERIFICATION STEPS

After all rotations are complete:

- [ ] Run `npm run dev` locally - app starts without errors
- [ ] Test Supabase authentication (sign in/sign up)
- [ ] Test database queries (dashboard loads data)
- [ ] Test OpenAI features (if any)
- [ ] Test Google Maps features
- [ ] Test SAM.gov opportunity search
- [ ] Test OAuth login flows
- [ ] Deploy to production and verify all features work

---

## 📚 PREVENTION MEASURES (Already Implemented ✅)

1. ✅ `.env.local` is in `.gitignore` (lines 35, 48)
2. ✅ `.env.local` is NOT in git history (verified)
3. ✅ `.env.example` exists for team reference

**Additional Recommendations:**
- Use a secret manager (1Password, AWS Secrets Manager, etc.) for production
- Implement environment variable validation with Zod
- Add pre-commit hooks to scan for secrets (git-secrets, detect-secrets)

---

## 🚨 IF CREDENTIALS WERE PUBLICLY EXPOSED

If this repository was ever public or credentials were shared:

1. ⚠️ Immediately rotate ALL credentials (treat as breach)
2. ⚠️ Review Supabase auth logs for unauthorized access
3. ⚠️ Review OpenAI usage logs for suspicious activity
4. ⚠️ Check Google Cloud billing for unexpected charges
5. ⚠️ Monitor database for unauthorized changes
6. ⚠️ Consider enabling 2FA on all service accounts

---

## ✅ COMPLETION

When all tasks are complete, mark this file:

**Rotation Completed:** [ ] YES / [ ] NO
**Date Completed:** _______________
**Completed By:** _______________
**Production Verified:** [ ] YES / [ ] NO

---

**Next Steps:** Once credentials are rotated, proceed to fix the remaining critical issues (TypeScript/ESLint configuration).
