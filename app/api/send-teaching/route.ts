import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const { to, teaching_number, teaching_title } = await request.json()

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }
    if (!teaching_number || typeof teaching_number !== 'number') {
      return NextResponse.json({ error: 'teaching_number is required' }, { status: 400 })
    }

    const cleanTo = to.trim().toLowerCase()
    const fromEmail = user.email
    const title = teaching_title || `Teaching ${teaching_number}`
    const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/teachings/${teaching_number}`

    const { error } = await resend.emails.send({
      from: 'Teachings of the Spirit <onboarding@resend.dev>',
      to: cleanTo,
      subject: `A Teaching from the Special Collections`,
      html: `
        <div style="font-family: Georgia, serif; color: #2A241C; max-width: 520px; margin: 0 auto; line-height: 1.6;">
          <p>Someone read this and thought of you. This is a Teaching from the Special Collections of TeachingsoftheSpirit.com</p>
          
          <p style="margin: 28px 0; font-size: 18px; font-weight: 500;">
            <a href="${link}" style="color: #2A241C; text-decoration: underline;">
              ${title.toUpperCase()}
            </a>
          </p>

          <p style="font-size: 14px; color: #6B5E54;">
            Sent by ${fromEmail}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}