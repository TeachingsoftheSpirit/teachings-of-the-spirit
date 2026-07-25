import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/verified'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Supabase already rejected the link (expired, used, etc.)
  if (error) {
    const msg = error_description || error
    console.error('Auth callback error from Supabase:', msg)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(msg)}`
    )
  }

  const supabase = await createClient()

  // PKCE flow (preferred)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('exchangeCodeForSession failed:', exchangeError.message)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(exchangeError.message)}`
    )
  }

  // Token-hash flow (email templates that still use it)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!verifyError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('verifyOtp failed:', verifyError.message)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(verifyError.message)}`
    )
  }

  return NextResponse.redirect(`${origin}/?key=invalid&reason=missing_params`)
}