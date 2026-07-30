import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'jprussell@protonmail.com'
const ALLOWED_KINDS = new Set(['note', 'gift', 'comp', 'support', 'reply'])

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.email || user.email !== ADMIN_EMAIL) {
    return null
  }
  return user
}

/** GET ?email=...  → list messages for that patron */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = (req.nextUrl.searchParams.get('email') || '')
      .trim()
      .toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const admin = adminClient()
    const { data, error } = await admin
      .from('member_messages')
      .select(
        'id, email, direction, body, created_at, read_at, created_by, kind, meta'
      )
      .eq('email', email)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Admin messages list error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] })
  } catch (err: any) {
    console.error('Admin messages GET:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/** POST { email, body, kind? } → send from_admin */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const text = typeof body.body === 'string' ? body.body.trim() : ''
    const kindRaw = typeof body.kind === 'string' ? body.kind : 'note'
    const kind = ALLOWED_KINDS.has(kindRaw) ? kindRaw : 'note'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }
    if (!text || text.length < 1) {
      return NextResponse.json({ error: 'body required' }, { status: 400 })
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: 'body too long' }, { status: 400 })
    }

    const admin = adminClient()
    const { data, error } = await admin
      .from('member_messages')
      .insert({
        email,
        direction: 'from_admin',
        body: text,
        created_by: user.email,
        kind,
        meta: {},
      })
      .select(
        'id, email, direction, body, created_at, read_at, created_by, kind, meta'
      )
      .single()

    if (error) {
      console.error('Admin messages insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Admin message to ${email} by ${user.email} kind=${kind}`)
    return NextResponse.json({ success: true, message: data })
  } catch (err: any) {
    console.error('Admin messages POST:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}