import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if welcome email was already sent
        const { data: profile } = await supabase
          .from('profiles')
          .select('welcome_email_sent')
          .eq('id', user.id)
          .single()

        if (!profile?.welcome_email_sent) {
          // Send the beautiful welcome email
          await resend.emails.send({
            from: 'The Rooms <concierge@teachingsofthespirit.com>',
            to: [user.email!],
            subject: "A Day's Advice",
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>A Day's Advice</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #F7F4EF; font-family: Georgia, serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F4EF; padding: 40px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #C9BEB0; border-radius: 8px; padding: 40px 50px; max-width: 600px;">
                        <tr>
                          <td style="text-align: center; color: #2C2522; font-size: 15px; line-height: 1.6;">
                            <p style="margin: 0 0 24px 0; font-size: 17px; color: #2C2522;">
                              You have been welcomed into the room.
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 17px; color: #2C2522;">
                              These words were given as living letters.
                            </p>

                            <h1 style="font-family: Georgia, serif; font-size: 26px; color: #2C2522; margin: 0 0 24px 0; font-weight: normal; text-decoration: underline;">
                              A Day's Advice
                            </h1>

                            <p style="margin: 0 0 8px 0; font-size: 17px; color: #2C2522; line-height: 1.7;">
                              Renew acquaintances made in other years.<br>
                              Seek out new people.<br>
                              Initiate conversations about theological matters.<br>
                              Do some reading.<br>
                              Sleep minimally.<br>
                              Sing joyfully.<br>
                              Be ready for unexpected opportunities.
                            </p>

                            <p style="margin-top: 40px; font-size: 16px; color: #6B5E54; font-style: italic;">
                              May they serve you well.
                            </p>
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

          // Mark that the welcome email was sent
          await supabase
            .from('profiles')
            .update({ welcome_email_sent: true })
            .eq('id', user.id)
        }
      }

      // Redirect to home page after login
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}