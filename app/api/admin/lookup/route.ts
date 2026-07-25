import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const q = (req.nextUrl.searchParams.get('q') || '').trim()
    if (!q) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }
    if (q.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const isEmail = q.includes('@')
    let query = admin.from('profiles').select('*')

    if (isEmail) {
      query = query.ilike('email', q.toLowerCase())
    } else {
      query = query.or(
        `username.ilike.%${q}%,email.ilike.%${q}%`
      )
    }

    const { data, error } = await query.limit(20)

    if (error) {
      console.error('Admin lookup error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members: data || [] })
  } catch (err: any) {
    console.error('Admin lookup unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}