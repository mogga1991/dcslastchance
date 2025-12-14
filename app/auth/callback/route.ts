import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    console.log('[Auth Callback] Processing OAuth callback', {
      origin,
      hasCode: !!code,
      fullUrl: request.url
    })

    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/sign-in?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      console.log('[Auth Callback] Successfully exchanged code for session', {
        userId: data?.user?.id,
        email: data?.user?.email,
      })

      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(`${origin}/dashboard`)
    }

    console.log('[Auth Callback] No code provided, redirecting to sign-in')
    return NextResponse.redirect(`${origin}/sign-in?error=no_code`)
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${request.url.split('?')[0].replace('/auth/callback', '/sign-in')}?error=server_error`)
  }
}
