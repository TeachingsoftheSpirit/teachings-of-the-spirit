import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { email, source = 'welcome' } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Store the email in profiles
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(
        {
          email: cleanEmail,
          source,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Send the welcome email
    const { data, error } = await resend.emails.send({
      from: 'The Rooms <onboarding@resend.dev>',
      to: [cleanEmail],
      subject: "A Day's Advice",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Day's Advice</title>
</head>
<body style="margin:0; padding:0; background-color:#E8DFC9; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8DFC9; padding: 52px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 480px; background-color:#F4EBDA; border: 1px solid #C9B896; border-radius: 3px; box-shadow: 0 2px 8px rgba(80,60,30,0.08);">
          <tr>
            <td style="padding: 52px 44px 40px 44px; text-align: center;">
              <div style="font-size: 27px; color: #2A241C; letter-spacing: 1.2px; margin-bottom: 42px; border-bottom: 1px solid #C2B08A; padding-bottom: 20px; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;">
                A Day's Advice
              </div>
              <div style="text-align: center; color: #2A241C; font-size: 17.5px; line-height: 1.95; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;">
                <p style="margin: 0 0 24px 0;">Renew acquaintances<br>made in other years.</p>
                <p style="margin: 0 0 24px 0;">Seek out new people.</p>
                <p style="margin: 0 0 24px 0;">Initiate conversations<br>about theological matters.</p>
                <p style="margin: 0 0 24px 0;">Do some reading.</p>
                <p style="margin: 0 0 24px 0;">Sleep minimally.</p>
                <p style="margin: 0 0 24px 0;">Sing joyfully.</p>
                <p style="margin: 0 0 10px 0;">Be ready for<br>unexpected opportunities.</p>
              </div>
              <div style="margin-top: 48px; font-size: 11px; color: #8A7B65; letter-spacing: 0.8px; font-family: Georgia, serif;">
                — Teachings of the Spirit
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}