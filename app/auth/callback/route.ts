import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function buildMagicLinkHtml() {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#F7F4EF; font-family: Georgia, 'Times New Roman', serif;">
  <div style="max-width:520px; margin:0 auto; padding:40px 24px; color:#2C2522;">
    <p style="margin:0 0 1.25em; font-size:18px; letter-spacing:0.02em;">
      You are in — Teachings of the Spirit
    </p>
    <p style="margin:0 0 1em; line-height:1.55;">
      Thanks for confirming the previous email. A “Special Collections” room is
      reserved for you now, with a desk full of Teachings. You will find both in
      the top right corner of the Home page.
    </p>
    <p style="margin:0 0 1em; line-height:1.55;">
      You can read all the Teachings, and Save any of them at your desk. No
      password is required for this free entry.
    </p>
    <p style="margin:0 0 1em; line-height:1.55;">
      Deeper membership (House Brew, Private Reserve) remains available if you
      ever wish to go further up and further in. There is no hurry.
    </p>
    <p style="margin:1.5em 0 0; font-size:14px; color:#6B5E54;">
      Teachings of the Spirit
    </p>
  </div>
</body>
</html>
`.trim()
}

async function ensureProfileAndMaybeGreet(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !user.id) {
    console.error('auth/callback: no user after session exchange')
    return
  }

  const email = user.email.trim().toLowerCase()
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('auth/callback: RESEND_API_KEY is missing in this process')
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Trigger on auth.users often inserts profiles before we run.
  // "Fresh" = created within the last 2 minutes → first entry, send letter.
  const { data: existing, error: lookupError } = await admin
    .from('profiles')
    .select('id, created_at, subscription_status')
    .eq('email', email)
    .maybeSingle()

  if (lookupError) {
    console.error('auth/callback profile lookup failed:', lookupError)
  }

  const createdMs = existing?.created_at
    ? new Date(existing.created_at).getTime()
    : 0
  const ageMs = createdMs ? Date.now() - createdMs : 0
  const isFresh = !existing || ageMs < 120_000

  console.log(
    `auth/callback: email=${email} hasProfile=${Boolean(existing)} ageMs=${ageMs} isFresh=${isFresh} hasResendKey=${Boolean(apiKey)} status=${existing?.subscription_status ?? 'null'}`
  )

  const { error: upsertError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (upsertError) {
    console.error('auth/callback profile upsert failed:', upsertError)
    return
  }

  if (!isFresh) {
    console.log('auth/callback: skip affirming email (not a fresh profile)')
    return
  }

  if (!apiKey) return

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: 'Teachings of the Spirit <hello@teachingsofthespirit.com>',
      to: email,
      subject: 'You are in — Teachings of the Spirit',
      html: buildMagicLinkHtml(),
    })
    if (error) {
      console.error('auth/callback Resend error:', error)
    } else {
      console.log('auth/callback Resend sent ok:', data)
    }
  } catch (mailErr) {
    console.error('auth/callback Resend threw:', mailErr)
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/verified'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    const msg = error_description || error
    console.error('Auth callback error from Supabase:', msg)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(msg)}`
    )
  }

  const supabase = await createClient()

  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      await ensureProfileAndMaybeGreet()
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('exchangeCodeForSession failed:', exchangeError.message)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(exchangeError.message)}`
    )
  }

  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!verifyError) {
      await ensureProfileAndMaybeGreet()
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('verifyOtp failed:', verifyError.message)
    return NextResponse.redirect(
      `${origin}/?key=invalid&reason=${encodeURIComponent(verifyError.message)}`
    )
  }

  return NextResponse.redirect(`${origin}/?key=invalid&reason=missing_params`)
}