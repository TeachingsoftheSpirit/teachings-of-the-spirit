import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const MAX_BODY = 2000

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const body = await req.json()
    const text =
      typeof body.body === 'string' ? body.body.trim() : ''
    if (!text) {
      return NextResponse.json({ error: 'Letter body is required' }, { status: 400 })
    }
    if (text.length > MAX_BODY) {
      return NextResponse.json(
        { error: `Letter must be ${MAX_BODY} characters or fewer` },
        { status: 400 }
      )
    }

    const teachingNumber =
      typeof body.teaching_number === 'number' && Number.isFinite(body.teaching_number)
        ? body.teaching_number
        : null

    const cleanEmail = user.email.trim().toLowerCase()

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Optional username from profile
    const { data: profile } = await admin
      .from('profiles')
      .select('username')
      .eq('email', cleanEmail)
      .maybeSingle()

    const { data, error } = await admin
      .from('letters')
      .insert({
        from_email: cleanEmail,
        from_username: profile?.username || null,
        body: text,
        teaching_number: teachingNumber,
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Letter insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, letter: data })
  } catch (err: any) {
    console.error('Letter unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}