# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for your FedSpace application.

## Current Status

✅ **Google OAuth** - Credentials configured and ready to use

## Google OAuth Setup

Your Google OAuth credentials are configured in `.env.local`:
- **Client ID**: See `GOOGLE_CLIENT_ID` in `.env.local`
- **Client Secret**: See `GOOGLE_CLIENT_SECRET` in `.env.local`

### Enable in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**
5. Enter your credentials from `.env.local`:
   - **Client ID**: Copy from `GOOGLE_CLIENT_ID` in your `.env.local` file
   - **Client Secret**: Copy from `GOOGLE_CLIENT_SECRET` in your `.env.local` file
6. Click **Save**

### Configure Redirect URIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - Development: `http://localhost:3002/auth/callback`
   - Supabase callback: `https://clxqdctofuxqjjonvytm.supabase.co/auth/v1/callback`
   - Production: `https://your-production-domain.com/auth/callback` (when ready)
5. Click **Save**

## Testing

After configuration, test the Google OAuth flow:

1. Navigate to `/sign-in` or `/auth-demo`
2. Click "Continue with Google"
3. You should be redirected to Google login
4. After successful authentication, you'll be redirected to `/dashboard`

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" error:**
- Make sure all redirect URIs are added to your Google Cloud Console
- Verify the Supabase callback URL matches exactly: `https://clxqdctofuxqjjonvytm.supabase.co/auth/v1/callback`

**"invalid_client" error:**
- Check that your Client ID and Secret match in both Supabase and `.env.local`
- Ensure there are no extra spaces in the credentials

**OAuth popup blocked:**
- Allow popups for your site in browser settings
- Try using a different browser

### Debug Steps

1. Check browser console for error messages
2. Verify Supabase project URL is correct in `.env.local`
3. Ensure Google OAuth is enabled in Supabase dashboard
4. Test with incognito/private browsing mode to rule out cache issues

## Production Checklist

Before deploying to production:

- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Set `NEXT_PUBLIC_APP_URL` in environment variables to production URL
- [ ] Test OAuth flow on staging environment first
- [ ] Configure proper email templates in Supabase for confirmations
- [ ] Verify callback URLs use HTTPS in production

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Social Login Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
