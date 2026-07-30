import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireUserEmail() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.email) return null
  return user.email.trim().toLowerCase()
}

/** GET — list my messages */
export async function GET() {
  try {
    const email = await requireUserEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const admin = service()
    const { data, error } = await admin
      .from('member_messages')
      .select(
        'id, email, direction, body, created_at, read_at, created_by, kind, meta'
      )
      .eq('email', email)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Member messages list error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const messages = data || []
    const unread = messages.filter(
      (m) => m.direction === 'from_admin' && !m.read_at
    ).length

    return NextResponse.json({ messages, unread })
  } catch (err: any) {
    console.error('Member messages GET:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * POST
 * { action: 'reply', body }
 * { action: 'mark_read', ids?: string[] }  — if no ids, mark all unread from_admin
 */
export async function POST(req: NextRequest) {
  try {
    const email = await requireUserEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const body = await req.json()
    const action = body.action
    const admin = service()

    if (action === 'mark_read') {
      const ids: string[] | undefined = Array.isArray(body.ids)
        ? body.ids.filter((x: unknown) => typeof x === 'string')
        : undefined

      let q = admin
        .from('member_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('email', email)
        .eq('direction', 'from_admin')
        .is('read_at', null)

      if (ids && ids.length > 0) {
        q = q.in('id', ids)
      }

      const { error } = await q
      if (error) {
        console.error('Member mark_read error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'reply') {
      const text = typeof body.body === 'string' ? body.body.trim() : ''
      if (!text) {
        return NextResponse.json({ error: 'body required' }, { status: 400 })
      }
      if (text.length > 8000) {
        return NextResponse.json({ error: 'body too long' }, { status: 400 })
      }

      const { data, error } = await admin
        .from('member_messages')
        .insert({
          email,
          direction: 'from_member',
          body: text,
          created_by: 'member',
          kind: 'reply',
          meta: {},
          read_at: new Date().toISOString(), // member's own reply is "read"
        })
        .select(
          'id, email, direction, body, created_at, read_at, created_by, kind, meta'
        )
        .single()

      if (error) {
        console.error('Member reply error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('Member messages POST:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}