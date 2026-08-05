import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Teachings of the Spirit <hello@teachingsofthespirit.com>',
      to: ['jprussell@protonmail.com'],
      subject: "A Day's Advice",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>A Day's Advice</title>
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #F7F4EF; font-family: Georgia, serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #C9BEB0; padding: 40px 50px;">
                  <tr>
                    <td style="text-align: center; color: #2C2522;">
                      <h1 style="font-size: 28px; margin: 0 0 30px 0; font-weight: normal; text-decoration: underline;">
                        A Day's Advice
                      </h1>
                      <p style="font-size: 17px; line-height: 1.8; margin: 0 0 8px 0;">
                        Renew acquaintances made in other years.<br>
                        Seek out new people.<br>
                        Initiate conversations about theological matters.<br>
                        Do some reading.<br>
                        Sleep minimally.<br>
                        Sing joyfully.<br>
                        Be ready for unexpected opportunities.
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}