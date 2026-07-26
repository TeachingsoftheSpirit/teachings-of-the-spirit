import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'jprussell@protonmail.com'
const MAX_REPLY = 4000

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin
      .from('letters')
      .select(
        'id, from_email, from_username, body, teaching_number, rumination_slug, created_at, read_at, reply_body, replied_at'
      )
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Admin letters error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ letters: data || [] })
  } catch (err: any) {
    console.error('Admin letters unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const letterId = typeof body.letterId === 'string' ? body.letterId.trim() : ''
    const replyText =
      typeof body.replyBody === 'string' ? body.replyBody.trim() : ''

    if (!letterId) {
      return NextResponse.json({ error: 'letterId is required' }, { status: 400 })
    }
    if (!replyText) {
      return NextResponse.json({ error: 'Reply body is required' }, { status: 400 })
    }
    if (replyText.length > MAX_REPLY) {
      return NextResponse.json(
        { error: `Reply must be ${MAX_REPLY} characters or fewer` },
        { status: 400 }
      )
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin
      .from('letters')
      .update({
        reply_body: replyText,
        replied_at: new Date().toISOString(),
        read_at: new Date().toISOString(),
      })
      .eq('id', letterId)
      .select('id, reply_body, replied_at')
      .single()

    if (error) {
      console.error('Admin reply error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, letter: data })
  } catch (err: any) {
    console.error('Admin reply unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}