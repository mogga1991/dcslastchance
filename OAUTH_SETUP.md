# OAuth Setup Guide

This guide explains how to configure Google and Apple OAuth for your FedSpace application.

## Current Status

✅ **Google OAuth** - Credentials already configured in `.env.local`
⚠️ **Apple OAuth** - Needs configuration in Supabase dashboard

## Setup Instructions

### 1. Google OAuth (Already Configured)

Your Google OAuth credentials are already set up:
- Client ID: `451355945244-sos89nn7hnh8ap9ftskg1r0d4l6kfk1n.apps.googleusercontent.com`
- Client Secret: Configured in `.env.local`

**To enable in Supabase:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**
5. Enter your credentials:
   - **Client ID**: `451355945244-sos89nn7hnh8ap9ftskg1r0d4l6kfk1n.apps.googleusercontent.com`
   - **Client Secret**: (from your `.env.local` file)
6. Set the **Authorized redirect URIs** in your Google Cloud Console:
   - Development: `http://localhost:3002/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
   - Supabase callback: `https://clxqdctofuxqjjonvytm.supabase.co/auth/v1/callback`
7. Click **Save**

### 2. Apple OAuth (Needs Setup)

**Step 1: Create an Apple Developer Account**
- Go to https://developer.apple.com
- Sign in with your Apple ID
- Enroll in the Apple Developer Program ($99/year)

**Step 2: Create a Service ID**

1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click the **+** button to create a new identifier
3. Select **Services IDs** and click **Continue**
4. Fill in the details:
   - **Description**: FedSpace Authentication
   - **Identifier**: `com.fedspace.auth` (or your bundle ID)
5. Click **Continue** and then **Register**

**Step 3: Configure Sign in with Apple**

1. Click on your newly created Service ID
2. Check **Sign in with Apple**
3. Click **Configure**
4. Add your domains and return URLs:
   - **Domains**:
     - `localhost` (for development)
     - `your-domain.com` (for production)
     - `clxqdctofuxqjjonvytm.supabase.co` (Supabase)
   - **Return URLs**:
     - `http://localhost:3002/auth/callback`
     - `https://your-domain.com/auth/callback`
     - `https://clxqdctofuxqjjonvytm.supabase.co/auth/v1/callback`
5. Click **Save** and then **Continue**
6. Click **Register**

**Step 4: Create a Private Key**

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click the **+** button
3. Enter a **Key Name**: "FedSpace Sign in with Apple Key"
4. Check **Sign in with Apple**
5. Click **Configure** and select your Primary App ID
6. Click **Save** and then **Continue**
7. Click **Register**
8. **Download the key file** (.p8) - you can only download this once!
9. Note your **Key ID** (10 characters, e.g., `ABC123DEFG`)

**Step 5: Configure in Supabase**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** in the list
4. Toggle it to **Enabled**
5. Enter your credentials:
   - **Services ID**: `com.fedspace.auth` (from Step 2)
   - **Team ID**: Your Apple Developer Team ID (found in your Apple Developer account)
   - **Key ID**: The 10-character ID from Step 4
   - **Private Key**: Open the downloaded .p8 file and paste the entire contents
6. Click **Save**

**Step 6: Add to Environment Variables** (Optional)

If you want to store these in your `.env.local` for reference:

```bash
# Apple OAuth
APPLE_CLIENT_ID=com.fedspace.auth
APPLE_TEAM_ID=YOUR_TEAM_ID_HERE
APPLE_KEY_ID=YOUR_KEY_ID_HERE
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENTS_HERE
-----END PRIVATE KEY-----"
```

## Testing

After configuration, test the OAuth flows:

1. Navigate to `/sign-in` or `/auth-demo`
2. Click "Continue with Google" - should redirect to Google login
3. Click "Continue with Apple" - should redirect to Apple login
4. After successful authentication, you should be redirected to `/dashboard`

## Troubleshooting

### Google OAuth Issues

- **"redirect_uri_mismatch"**: Make sure all redirect URIs are added to your Google Cloud Console
- **"invalid_client"**: Check that your Client ID and Secret match in both Supabase and `.env.local`

### Apple OAuth Issues

- **"invalid_client"**: Verify your Services ID matches exactly
- **"invalid_grant"**: Check that your domains and return URLs are correctly configured
- **"invalid_key"**: Ensure the private key is copied correctly with headers and footers

### General Issues

- Check browser console for errors
- Verify Supabase project URL matches in both frontend and Supabase dashboard
- Ensure redirect URLs use HTTPS in production (HTTP only works for localhost)

## Production Checklist

Before deploying to production:

- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Update Apple OAuth domains and return URLs with production domain
- [ ] Set `NEXT_PUBLIC_APP_URL` in `.env.local` to production URL
- [ ] Test OAuth flows on staging environment first
- [ ] Configure proper email templates in Supabase for confirmations

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
